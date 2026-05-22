<template>
  <AppModal v-model="showModal">
    <AppFormModal v-if="showModal" :title="'Tu sesión está por terminar'">
      <template v-slot:content>
        <div class="d-flex align-items-center gap-3">
          <AppIcon icon="exclamation-triangle" size="3x" class="text-warning"></AppIcon>
          <div>
            <span class="tw-font-light tw-text-lg">
              ¡Atención! Tu sesión expirará en
              <span class="tw-text-red-500 tw-font-bold tw-text-lg">
                {{ formattedTime }}
              </span>
              ¿Quieres seguir conectado?
            </span>
            <br />
          </div>
        </div>
      </template>
      <template v-slot:actions>
        <AppButton variant="primary" @click="refreshToken">
          {{ t('core.continue') }}
        </AppButton>
      </template>
    </AppFormModal>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

import AppFormModal from './AppFormModal.vue';
import AppModal from './AppModal.vue';
import AppIcon from '../AppIcon.vue';
import AppButton from '../Buttons/AppButton.vue';
import { SignOutService } from '../../services/signOut.service';
import { PostRefreshTokenService } from '../../services/postRefreshToken.service';

const signOutService = new SignOutService();
const postRefreshTokenService = new PostRefreshTokenService();

export default defineComponent({
  name: 'AppRefreshTokenModal',
  components: { AppButton, AppIcon, AppFormModal, AppModal },
  setup() {
    const { t } = useI18n();
    const showModal = ref(false);
    const timeLeft = ref(0);
    let checkInterval: ReturnType<typeof setInterval> | undefined = undefined;
    let countdownInterval: ReturnType<typeof setInterval> | undefined = undefined;

    const warnFiveMinutes = ref(false);
    const warnOneMinute = ref(false);

    //Obtener el tiempo de expiración desde el token JWT
    const getTokenExpiration = (): number | null => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      try {
        const payloadBase64 = token.split('.')[1]; // Obtener payload
        const payload = JSON.parse(atob(payloadBase64)); // Decodificar
        return payload.exp || null; // `exp` es el tiempo UNIX de expiración
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    };

    //Verifica si el token está por expirar
    const checkSession = () => {
      const expiration = getTokenExpiration();
      if (!expiration) {
        logout();
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      timeLeft.value = expiration - currentTime;
      //console.log('Tiempo restante:', timeLeft.value,'currentTime', currentTime,'expiration', expiration);
      if (timeLeft.value <= 60 && !warnOneMinute.value) {
        warnOneMinute.value = true;
        showModal.value = true;
      } else if (timeLeft.value <= 300 && !warnFiveMinutes.value) {
        // Mostrar modal si quedan 5 min o menos
        warnFiveMinutes.value = true;
        showModal.value = true;
        startCountdown();
      }
    };

    //Inicia el contador regresivo en tiempo real
    const startCountdown = () => {
      if (countdownInterval) return; // Evita múltiples intervalos

      countdownInterval = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
        } else {
          clearInterval(countdownInterval);
          showModal.value = false;
          logout();
        }
      }, 1000);
    };

    //Formatear `timeLeft` en `mm:ss`
    const formattedTime = computed(() => {
      const minutes = Math.floor(timeLeft.value / 60);
      const seconds = timeLeft.value % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });

    const refreshToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }

      try {
        // Hacer la petición para el refresco de token
        let params = {
          token: token,
        };
        const res = await postRefreshTokenService.run(params);
        const newToken = res.token;
        localStorage.setItem('token', newToken);

        warnFiveMinutes.value = false;
        warnOneMinute.value = false;

        showModal.value = false;
        clearInterval(countdownInterval); // Detener el contador
      } catch (error) {
        console.error('Error renovando el token:', error);
        logout();
      }
    };

    const logout = () => {
      signOutService.run();
      window.location.reload();
    };

    onMounted(() => {
      checkSession();
      checkInterval = setInterval(checkSession, 10000); // Revisar cada 10s
    });

    onUnmounted(() => {
      clearInterval(checkInterval);
      clearInterval(countdownInterval);
    });

    return {
      t,
      showModal,
      refreshToken,
      formattedTime,
    };
  },
});
</script>
