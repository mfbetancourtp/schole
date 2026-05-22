<template>
  <div class="d-flex flex-column w-100 h-100 justify-content-center align-items-center p-4">
    <div class="login-container shadow-sm w-100">
      <div class="card-body">
        <router-link to="/" class="form__logo">
          <img class="logo-icon" :src="appLogo?.toString()" />
        </router-link>
        <form @submit.prevent="save">
          <p class="mt-4 text-center">Ingrese su nombre de usuario para solicitar el enlace de restablecimiento de contraseña.</p>

          <AppFormFieldLogin class="input-email" :form-control="v$.form.email">
            <input type="text" class="form__input" id="textEmail" placeholder=" " v-model="v$.form.email.$model" />
            <label for="textEmail" class="form__label">Usuario</label>
            <AppGetIcon class="form__icon" name="Icon-person" fillColor="none" strokeColor="var(--color-primary)" />
          </AppFormFieldLogin>

          <div class="button-request">
            <button class="button-login__start" :disabled="loading">Solicitar enlace</button>
          </div>

          <div class="alert alert-success mt-2" v-if="!loading && success">Se ha enviado un mensaje con el enlace para restablecer la contraseña al correo electrónico registrado.</div>

          <div class="text-center mt-2">
            <router-link :to="{ name: 'auth.login' }"> Iniciar sesión </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';

import { settings } from '../../../shared/constant/settings.contants';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

import AppFormFieldLogin from '../components/AppFormFieldLogin.vue';

import { GeolocationService } from '../../../shared/services/geolocation.service';
import { PasswordChangeRequestService } from '../services/passwordChangeRequest.service';

const geolocationService = new GeolocationService();
const passwordChangeRequestService = new PasswordChangeRequestService();

export default defineComponent({
  name: 'RememberPasswordRequest',
  components: {
    AppGetIcon,

    AppFormFieldLogin,
  },

  setup() {
    const appLogo = settings.appLogo;

    useMeta({ title: 'Recordar contraseña' });

    const position = ref<any>(null);

    const loading = ref(false);
    const success = ref(false);

    const form = reactive({
      email: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          email: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      await getPosition();
    });

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

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      loading.value = true;

      try {
        const ip = await geolocationService.getPublicIP();
        let locationInfo: any = {};

        if (position.value) {
          locationInfo = await geolocationService.getCityAndCountry(position.value.coords.latitude, position.value.coords.longitude);
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
          userAgent: navigator.userAgent,
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language || (navigator as any).userLanguage || 'es-CO',
        };

        await passwordChangeRequestService.run(form.email, payload);
        success.value = true;
      } catch (e) {
        success.value = false;
      }

      loading.value = false;
    };

    return {
      appLogo,
      loading,
      success,
      v$,
      save,
    };
  },
});
</script>

<style scoped>
.login-container {
  max-width: 450px;
}

.img-main {
  max-width: 300px;
}

.card-body {
  padding: 3rem;
  box-shadow: 1px 2px 6px #00000073;
  border-radius: 16px;
}

.form__logo {
  display: flex;
  justify-content: center;
  text-align: center;
}

.logo-icon {
  max-width: 260px;
}
.input-email {
  position: relative;
  width: 100%;
  margin: 30px 0px;
}
.form__input {
  width: 100%;
  height: 48px;
  display: block;
  padding: 0px 0px 0px 17px;
  border-radius: 8px;
  border: 0;
  outline: 1px solid #5b5f62;
}
.form__label {
  position: absolute;
  top: 12px;
  background: white;
  margin: 0px 50px 0px 13px;
  color: #5b5f62;
  transition: all 0.5s;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
}
.form__input:focus {
  outline: solid 2px #f04242;
}

.form__input:focus + .form__label {
  transform: translateY(-1.6rem);
  font-size: 16px;
  color: #f04242;
}

.form__input:not(:placeholder-shown) + .form__label {
  transform: translateY(-1.6rem);
  transition: 0.5s;
  font-size: 16px;
}
.form__icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: unset;
  right: 14px;
}
.button-request {
  margin: 16px 0px 24px 0px;
}

.button-login__start {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  padding: 8px 10px;
  background: #f04242;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 24px;
}
</style>
