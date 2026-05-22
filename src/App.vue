<script lang="ts">
import AppToast from './shared/components/AppToast.vue';
import { onMounted, ref, computed } from 'vue';
import { settings } from './shared/constant/settings.contants';
import { GetInitDataService } from './shared/services/getInitData.service';
import { IsAuthenticatedService } from './shared/services/isAuthenticated.service';
import { InitDataDto } from './shared/dto/initData.dto';
import { useInitDataStore } from './stores/initData.store';
import { useRoute } from 'vue-router';

const getInitDataService = new GetInitDataService();
const isAuthenticatedService = new IsAuthenticatedService();

export default {
  components: { AppToast },
  setup() {
    const route = useRoute();

    const appName = settings.appName;
    const getinit = ref<InitDataDto | null>(null);
    const initStore = useInitDataStore();

    const protocol = ref(route.query.protocol as string | undefined);
    const SAMLRequest = ref(route.query.SAMLRequest as string | undefined);
    const RelayState = ref(route.query.RelayState as string | undefined);
    const redirectURL = ref(route.query.redirectURL as string | undefined);

    const token = ref(localStorage.getItem('token'));

    const isExternalFlow = computed(() => {
      return !!(protocol.value || SAMLRequest.value || RelayState.value || redirectURL.value);
    });

    onMounted(async () => {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = settings.appFavicon as string;
      document.getElementsByTagName('head')[0].appendChild(link);

      if (!document.title) {
        document.title = appName as string;
      }

      // ✅ CLAVE:
      // Si la app viene en flujo externo, NO hagas autoingreso ni initData aquí
      if (isExternalFlow.value) {
        console.log('Flujo externo detectado, se omite auto bootstrap');
        return;
      }

      // Flujo normal de app autenticada
      if (isAuthenticatedService.run()) {
        try {
          const response = await getInitDataService.run();
          getinit.value = response;
          initStore.setInitData(response);
        } catch (error) {
          console.error('Error fetching initial data:', error);
        }
      }

      const institutionId = Number(getinit.value?.user?.people?.institutionId);
      const institutions: any = getinit.value?.userInstitutions ?? [];

      const currentInstitution = institutions.find((institution: { institutionId: number }) => institution.institutionId === institutionId);

      const { primary, primaryRGB, secondary, secondaryRGB } = {
        primary: currentInstitution?.institution?.colorPrimary ?? settings.colors.primary,
        primaryRGB: currentInstitution?.institution?.colorPrimaryRgb ?? settings.colors.primaryRGB,
        secondary: currentInstitution?.institution?.colorSecondary ?? settings.colors.secondary,
        secondaryRGB: currentInstitution?.institution?.colorSecondaryRgb ?? settings.colors.secondaryRGB,
      };

      function applyColors({ primary, primaryRGB, secondary, secondaryRGB }: any) {
        document.documentElement.style.setProperty('--color-primary', primary);
        document.documentElement.style.setProperty('--color-primary-rgb', primaryRGB);
        document.documentElement.style.setProperty('--color-secondary', secondary);
        document.documentElement.style.setProperty('--color-secondary-rgb', secondaryRGB);

        document.documentElement.style.setProperty('--bs-primary', primary);
        document.documentElement.style.setProperty('--bs-primary-rgb', primaryRGB);
        document.documentElement.style.setProperty('--bs-secondary', secondary);
        document.documentElement.style.setProperty('--bs-secondary-rgb', secondaryRGB);

        document.documentElement.style.setProperty('--p-primary-color', primary);
        document.documentElement.style.setProperty('--p-primary-hover-color', secondary);
        document.documentElement.style.setProperty('--p-primary-active-color', primary);
      }

      applyColors({ primary, primaryRGB, secondary, secondaryRGB });
    });

    return {
      appName,
    };
  },
};
</script>

<template>
  <metainfo>
    <template v-slot:title="{ content }">{{ content ? `${content} | ${appName}` : `${appName}` }}</template>
  </metainfo>
  <router-view></router-view>
  <AppToast></AppToast>
</template>

<style>
/* ======================================================
   🎨 ESTILOS GENERALES - VARIABLES DINÁMICAS BOOTSTRAP
   ====================================================== */

.home-section a {
  color: var(--color-primary);
  transition: all 0.2s ease;
}

.home-section a:hover {
  color: var(--color-primary);
  filter: brightness(0.85);
}

/* Header links hover secundarios */
.home-section .header-content a:hover {
  color: var(--color-secondary);
}

/* ======================================================
   ✅ CHECKBOX / FORM-CHECK
   ====================================================== */

.home-section .form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.home-section .form-check-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.25rem rgba(var(--color-primary-rgb), 0.25);
}

/* Fallback Bootstrap */
.form-check-input:checked {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(var(--color-primary-rgb), 0.25) !important;
}

/* ======================================================
   📊 PROGRESS
   ====================================================== */

.home-section .progress-bar {
  background-color: var(--color-primary);
}

/* ======================================================
   ❌ BTN CLOSE
   ====================================================== */

.home-section .btn-close:focus {
  box-shadow: 0 0 0 0.25rem rgba(var(--color-primary-rgb), 0.25);
}

/* ======================================================
   🧱 BORDER PRIMARY
   ====================================================== */

.home-section .border-primary {
  border-color: var(--color-primary) !important;
}

/* ======================================================
   📝 INPUTS
   ====================================================== */

.home-section .form-control:focus {
  border-color: rgba(var(--color-primary-rgb), 0.5);
  box-shadow: 0 0 0 0.2rem rgba(var(--color-primary-rgb), 0.15);
}

/* ======================================================
   📂 DROPDOWN
   ====================================================== */

.dropdown-item:active {
  background-color: var(--color-primary);
  color: #fff;
}

/* ======================================================
   🧭 NAV TABS
   ====================================================== */

.nav-link {
  color: var(--color-primary) !important;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--color-secondary) !important;
}

.nav-tabs .nav-link.active,
.nav-tabs .nav-item.show .nav-link {
  color: var(--color-secondary) !important;
  border-color: var(--color-primary) var(--color-primary) #fff;
}

/* ======================================================
   🎯 UTILIDADES EXTRA (RECOMENDADO)
   ====================================================== */

/* Botones primarios */
.btn-primary {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.btn-primary:hover {
  filter: brightness(0.9);
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

/* Botones outline */
.btn-outline-primary {
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.btn-outline-primary:hover {
  background-color: var(--color-primary) !important;
  color: #fff !important;
}

/* Links secundarios */
.text-secondary {
  color: var(--color-secondary) !important;
}

/* Badge primaria */
.badge-primary {
  background-color: var(--color-primary);
}

/* Focus accesible general */
:focus-visible {
  outline: 2px solid rgba(var(--color-primary-rgb), 0.5);
  outline-offset: 2px;
}
</style>
