<template>
  <!-- SAML auto-redirect: si ya hay token y llegan params SAML -->
  <div v-if="samlAutoRedirecting" class="saml-redirect-overlay">
    <div class="saml-redirect-card">
      <img :src="appLogo?.toString()" alt="Logo" class="saml-redirect-logo" />
      <div class="saml-spinner"></div>
      <h3 class="saml-redirect-title">Conectando con el curso</h3>
      <p class="saml-redirect-text">Estamos redirigiendo a la plataforma de aprendizaje. Por favor espere...</p>
    </div>
  </div>

  <div v-else-if="!istoken" class="login-wrapper">
    <div class="login-aside">
      <div class="aside-overlay"></div>
      <img class="aside-img" src="../../../assets/icons__login/icon__fondo.svg" alt="Background" />
      <div class="aside-content">
        <img src="../../../assets/images/Kami-Saludo2.gif" alt="Saludo Kami" class="aside-gif" />
        <h2>Impulsa tu aprendizaje</h2>
        <p>Gestiona tu futuro académico con un solo clic.</p>
      </div>
    </div>

    <main class="login-main">
      <div class="login-card">
        <header class="login-header">
          <img class="brand-logo" :src="appLogo?.toString()" alt="Logo" />
          <h1 class="title">¡Bienvenido de nuevo!</h1>
          <p class="subtitle">Ingresa tus credenciales para acceder</p>

          <div v-if="googleError" class="text-center alert alert-warning" role="alert">
            <AppGetIcon name="Icon-person" :strokeColor="'#94a3b8'" style="width: 18px; height: 18px" class="me-1" />
            <strong> {{ googleError === 'user_not_found' ? 'Usuario no encontrado' : googleError }}</strong>
          </div>
        </header>

        <form class="login-form" @submit.prevent>
          <div class="input-group">
            <AppFormFieldLogin :formControl="v$.form.textUser">
              <div class="input-relative">
                <input type="text" id="textUser" placeholder=" " v-model="v$.form.textUser.$model" class="custom-input" />
                <label for="textUser" class="custom-label">Usuario</label>
                <AppGetIcon class="input-icon" name="Icon-person" :strokeColor="'#94a3b8'" />
              </div>
            </AppFormFieldLogin>
          </div>

          <div class="input-group">
            <AppFormFieldLogin :formControl="v$.form.textPass">
              <div class="input-relative">
                <input :type="showPassword ? 'text' : 'password'" id="textPass" placeholder=" " v-model="v$.form.textPass.$model" class="custom-input" />
                <label for="textPass" class="custom-label">Contraseña</label>
                <button type="button" class="input-icon btn-toggle" @click="showPassword = !showPassword">
                  <AppGetIcon :name="showPassword ? 'icon-pass-view' : 'icon-pass'" :strokeColor="'#94a3b8'" />
                </button>
              </div>
            </AppFormFieldLogin>
          </div>

          <div class="form-options">
            <label class="checkbox-container">
              <input type="checkbox" id="Remember" />
              <span class="checkmark"></span>
              Recuérdame
            </label>
            <router-link :to="{ name: 'auth.rememberPasswordRequest' }" class="forgot-link"> ¿Olvidaste tu contraseña? </router-link>
          </div>

          <button class="btn-primary" :disabled="loading" @click="login">
            <span>Iniciar sesión</span>
          </button>

          <div class="divider">
            <div class="line-footer__left"></div>
            <span>o continuar con</span>
            <div class="line-footer__right"></div>
          </div>

          <button class="btn-google" type="button" :disabled="loading" @click="loginWithGoogle">
            <AppGetIcon name="icon-google" style="width: 30px; height: 30px" />
            Google
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { settings } from '../../../shared/constant/settings.contants';

import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

import AppFormFieldLogin from '../components/AppFormFieldLogin.vue';

import { GeolocationService } from '../../../shared/services/geolocation.service';
import { LoginService } from '../services/login.service';
import { LoginAplicationExternalService } from '../services/loginAplicationExternal.service';
import { LoginCallBackService } from '../services/loginCallBack';
import { SamlConfirmService } from '../services/loginSamlConfirm.service';

const geolocationService = new GeolocationService();
const loginService = new LoginService();
const loginAplicationExternalService = new LoginAplicationExternalService();
const loginCallBackService = new LoginCallBackService();

const samlConfirmService = new SamlConfirmService();

export default defineComponent({
  name: 'AppLogin',
  components: {
    AppFormFieldLogin,
    AppGetIcon,
  },
  props: ['redirect', 'inCasurid'],
  setup() {
    const route = useRoute();
    const router = useRouter();
    const appLogo = settings.appLogo;
    const form = reactive({
      textUser: '',
      textPass: '',
    });
    let defaultRouteRedirect = '';
    const loading = ref<boolean>(false);
    const position = ref<any>(null);
    const istoken = ref<boolean>(false);
    const samlAutoRedirecting = ref<boolean>(false);
    const samlError = ref<string>('');

    // Mensajes para UI (opcional)
    const googleError = ref<string>('');
    const googleMessage = ref<string>('');
    const token = route.query.token as string | undefined;

    if (route.query.redirectURL) {
      defaultRouteRedirect = route.query.redirectURL as string;
    }
    const protocol = ref(route.query.protocol as string | undefined);
    const SAMLRequest = ref(route.query.SAMLRequest as string | undefined);
    const RelayState = ref(route.query.RelayState as string | undefined);

    /**
     * Extrae un mensaje legible del error SAML (backend o red).
     */
    function extractSamlErrorMessage(error: any): string {
      const data = error?.response?.data;
      if (data?.message) return data.message;
      if (typeof data === 'string') return data;
      if (error?.message) return error.message;
      return 'Error en la autenticación SAML. Por favor inicie sesión nuevamente.';
    }

    /**
     * Si el usuario ya está autenticado (tiene token) y llegan parámetros SAML,
     * ejecutar el flujo SAML automáticamente sin pedir credenciales.
     */
    async function handleSamlAutoRedirect(): Promise<boolean> {
      const existingToken = localStorage.getItem('token');
      const hasSamlParams = !!(SAMLRequest.value && protocol.value === 'saml');

      if (!existingToken || !hasSamlParams) return false;

      samlAutoRedirecting.value = true;

      try {
        const response: any = await samlConfirmService.run(
          {
            SAMLRequest: SAMLRequest.value,
            RelayState: RelayState.value || '',
          },
          existingToken
        );

        await loginCallBackService.run({
          SAMLResponse: response.SAMLResponse,
          RelayState: RelayState.value || '',
          callbackUrl: response.callbackUrl,
        });

        return true;
      } catch (e: any) {
        console.error('SAML auto-redirect falló:', e);
        samlAutoRedirecting.value = false;

        // Mostrar error y dejar el formulario con los params SAML intactos
        // para que el usuario se autentique y se ejecute el flujo SAML manual
        samlError.value = extractSamlErrorMessage(e);

        return false;
      }
    }

    onMounted(async () => {
      // Primero intentar SAML automático si ya hay token
      const samlHandled = await handleSamlAutoRedirect();
      if (samlHandled) return;

      await getPosition();
      await handleGoogleCallback();
    });
    async function handleGoogleCallback() {
      // ✅ Si el backend manda auth-success?token=...&message=...
      const token = route.query.token as string | undefined;
      const message = route.query.message as string | undefined;

      istoken.value = token ? true : false;
      // ❌ Si falla: /auth/login?error=user_not_found
      const error = route.query.error as string | undefined;

      if (error) {
        googleError.value = error;
        // Limpia la URL (para que no quede el error pegado)
        await router.replace({
          path: route.path,
          query: { redirectURL: route.query.redirectURL as any },
        });
        return;
      }

      if (token) {
        // 1) Guardar token
        localStorage.setItem('token', token);

        // (opcional) si tu app usa otro key:
        // localStorage.setItem('access_token', token);

        // 2) Mensaje
        googleMessage.value = message || 'Bienvenido';

        // 3) MUY IMPORTANTE: limpia la URL y redirige
        window.location.assign(defaultRouteRedirect || '/');
      }
    }
    async function getPosition() {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            position.value = pos;
          },
          (err) => {
            console.error('Error obteniendo ubicación:', err);
          }
        );
      }
    }

    const getCssVariable = (variableName: string) => {
      return getComputedStyle(document.documentElement).getPropertyValue(variableName);
    };
    return {
      v$: useVuelidate(
        {
          form: {
            textUser: {},
            textPass: {},
          },
        },
        { form }
      ),
      form,
      appLogo,
      defaultRouteRedirect,
      loading,
      getCssVariable,
      position,
      googleError,
      googleMessage,
      istoken,
      samlAutoRedirecting,
      samlError,
      protocol,
      SAMLRequest,
      RelayState,
    };
  },
  data() {
    return {
      messageWelcome: '',
      showModal: false,
      showPassword: false,
    };
  },
  methods: {
    loginWithGoogle(): void {
      if (this.loading) return;
      window.location.href = 'https://akademia-university-api-test.kamilainnovation.co/auth/google';
    },

    async login(): Promise<void> {
      const formIsValid = await this.v$.$validate();
      if (!formIsValid || this.loading) return;

      this.loading = true;

      try {
        const ip = await geolocationService.getPublicIP();
        let locationInfo: any = {};

        if (this.position) {
          locationInfo = await geolocationService.getCityAndCountry(this.position.coords.latitude, this.position.coords.longitude);
        } else {
          locationInfo = {
            city: null,
            country: null,
          };
        }

        const payload = {
          ipAddress: ip,
          city: locationInfo.city || null,
          country: locationInfo.country || null,
          username: this.form.textUser,
          password: this.form.textPass,
          userAgent: navigator.userAgent,
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language || (navigator as any).userLanguage || 'es-CO',
        };
        if (!this.protocol) {
          // Flujo normal: login tradicional
          await loginService.run(payload);
          window.location.href = this.defaultRouteRedirect ? this.defaultRouteRedirect : '/';
        } else {
          // Flujo SAML manual: autenticar + confirm + redirect al SP
          const loginAplicationExternal = await loginAplicationExternalService.run(payload);

          const response: any = await samlConfirmService.run(
            {
              SAMLRequest: this.SAMLRequest,
              RelayState: this.RelayState || '',
            },
            loginAplicationExternal.token
          );

          await loginCallBackService.run({
            SAMLResponse: response.SAMLResponse,
            RelayState: this.RelayState || '',
            callbackUrl: response.callbackUrl,
          });
        }

        this.loading = false;
      } catch (e: any) {
        this.loading = false;

        // Si estábamos en flujo SAML, mostrar error pero mantener los params
        // para que el usuario pueda reintentar con sus credenciales
        if (this.protocol) {
          const data = e?.response?.data;
          this.samlError = data?.message || e?.message || 'Error en la autenticación SAML. Intente nuevamente.';
        }
      }
    },
  },
});
</script>

<style scoped>
html,
body {
  height: 100%;
}

body {
  overflow: hidden; /* el scroll lo maneja .login-wrapper en mobile */
}
/* 1. VARIABLES Y BASE */
:host {
  --color-primary-hover: color-mix(in srgb, var(--color-primary) 85%, white);
  --text-main: #1e293b;
  --text-muted: #64748b;
  --bg-card: #ffffff;
  --border-color: #e2e8f0;
}

.login-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  overflow-x: hidden;
}

/* 2. ASIDE (Lado Izquierdo - Escritorio) */
.login-aside {
  position: relative;
  flex: 1.2; /* Le damos un poco más de peso visual al fondo */
  display: none;
  overflow: hidden;
  /* Centrado vertical perfecto del contenido */
  align-items: center;
  justify-content: center;
}

/* Imagen de fondo y Overlay */
.aside-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  /* animation: slowZoom 20s infinite alternate ease-in-out; */
}

.aside-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(193, 193, 193, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%);
  z-index: 2;
}

/* Contenedor de Texto y GIF */
.aside-content {
  position: relative;
  z-index: 10;
  color: white;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  animation: slideRight 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.aside-gif {
  width: 180px;
  height: auto;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.2));
  /* Combinamos flotado con un ligero pulso de escala */
  animation: floatAndPulse 4s ease-in-out infinite;
}

.aside-content h2 {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.aside-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* 3. MAIN (Lado Derecho / Card en Mobile) */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 10;
  flex-direction: column;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  border-radius: 20px;
  animation: cardEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
/* Aplicamos un retraso a cada grupo para que aparezcan en cascada */
.login-header {
  animation: slideUpFade 0.5s ease-out 0.2s both;
}
.input-group:nth-child(1) {
  animation: slideUpFade 0.5s ease-out 0.3s both;
}
.input-group:nth-child(2) {
  animation: slideUpFade 0.5s ease-out 0.4s both;
}
.form-options {
  animation: slideUpFade 0.5s ease-out 0.5s both;
}
.btn-primary {
  animation: slideUpFade 0.5s ease-out 0.6s both;
}
.divider {
  animation: slideUpFade 0.5s ease-out 0.7s both;
}
.btn-google {
  animation: slideUpFade 0.5s ease-out 0.8s both;
}
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.brand-logo {
  max-width: 240px;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-main);
  text-align: center;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  text-align: center;
}

/* 4. FORMULARIO E INPUTS */
.input-group {
  margin-bottom: 1.2rem;
}

.input-relative {
  position: relative;
}

.custom-input {
  width: 100%;
  height: 52px;
  padding: 0 1rem;
  padding-right: 3rem;
  border: 1px solid #d2dce4;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #f8fafc; /* Un gris muy tenue para el fondo del input */
}

.custom-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
  transform: translateY(-1px); /* Pequeño levante al enfocar */
}

.custom-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  transition: all 0.2s;
  padding: 0 4px;
}

.custom-input:focus + .custom-label,
.custom-input:not(:placeholder-shown) + .custom-label {
  top: 0;
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 700;
  background: white;
}

.input-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

/* 5. BOTONES Y EXTRAS */
.btn-primary {
  width: 100%;
  padding: 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover,
.btn-google:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
}

.forgot-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.line-footer__left,
.line-footer__right {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.btn-google {
  width: 100%;
  padding: 0.8rem;
  background: white;
  border: 1px solid #d2dce4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* 6. ANIMACIONES */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(2deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes floatAndPulse {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.05);
  }
}

@keyframes slowZoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animación de error (Shake) */
.error-banner {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

/* 7. RESPONSIVE (Móvil y Tablet) */
@media (min-width: 1024px) {
  .login-aside {
    display: flex;
  }
}
@media (min-width: px) {
  .login-aside {
    display: flex;
  }
}
@media (max-width: 1024px) {
  /* El fondo ahora ocupa toda la pantalla */
  .login-aside {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1;
  }

  /* Centramos el GIF sobre la card */
  .aside-content {
    position: absolute;
    top: 50px; /* Ajusta según quieras que tan arriba se vea el robot */
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
  }

  .aside-content h2,
  .aside-content p {
    display: none; /* Ocultamos textos para dejar solo al robot */
  }

  .aside-gif {
    display: none;
  }

  /* La Card flotante */

  .login-card {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .login-wrapper {
    /* deja de "centrar todo" y permite scroll */
    align-items: flex-start;
    justify-content: center;

    height: 100vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .login-main {
    /* que pueda crecer y no corte */
    align-items: flex-start;
    min-height: 100%;
    width: 100%;
    padding: 1rem; /* opcional */
  }

  .login-card {
    margin: 1rem auto; /* aire arriba/abajo para que se vea el scroll */
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
    max-width: 90%;
  }
  .aside-gif {
    width: 110px;
  }
  .login-main {
    padding: 0;
  }
}
/* ✅ Mobile pequeño */
@media (max-width: 480px) {
  .login-main {
    padding: 0.75rem;
  }

  .login-card {
    padding: 1.5rem;
    max-width: 92%;
    margin: 0.75rem auto;
  }
}

/* SAML auto-redirect */
.saml-redirect-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  z-index: 9999;
}

.saml-redirect-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 2.5rem 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  max-width: 400px;
  width: 90%;
  animation: cardEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.saml-redirect-logo {
  max-width: 180px;
  margin-bottom: 1.5rem;
}

.saml-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #e0e0e0;
  border-top-color: var(--color-primary, #f43f5e);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.2rem;
}

.saml-redirect-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  text-align: center;
}

.saml-redirect-text {
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
