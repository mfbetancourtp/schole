<template>
  <nav class="navbar bg-white navbar-light bg-light shadow-sm px-3 justify-content-between">
    <div>
      <router-link to="/" class="app-name">
        <img :src="appLogo" class="img-fluid logo-institution" />
      </router-link>
    </div>

    <div class="d-flex gap-2">
      <router-link
        class="btn"
        v-if="!user"
        type="button"
        v-tooltip="'Iniciar sesión'"
        :to="{
          name: 'auth.login',
          query: { redirectURL: `/surveys/user-convocations/${institutionId}` },
        }"
      >
        <AppIcon icon="sign-in-alt" class="me-2 text-primary" size="lg" />
      </router-link>

      <AppDropdown v-else-if="!isAdmin">
        <template v-slot:button>
          <button type="button" class="btn">
            <AppIcon icon="user-circle" class="text-primary" size="lg" />
          </button>
        </template>

        <template v-slot:items>
          <li>
            <router-link
              class="dropdown-item"
              type="button"
              :to="{
                name: 'surveys.userConvocations.myConvocationsPage',
                params: { institutionId: institutionId },
              }"
            >
              <AppIcon icon="graduation-cap" class="me-2 blue"></AppIcon>
              Mis procesos de matriculación
            </router-link>

            <hr />

            <button class="dropdown-item" type="button" @click="signOut">
              <AppIcon icon="sign-out-alt" class="me-2 blue"></AppIcon>
              {{ t('core.signOut') }}
            </button>
          </li>
        </template>
      </AppDropdown>
    </div>
  </nav>

  <router-view></router-view>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { settings } from '../../../shared/constant/settings.contants';
import AuthenticatedUserStore from '../../../shared/stores/authenticatedUser.store';
//import { InstitutionDto } from '../../casurid/dtos/institution.dto';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDropdown from '../../../shared/components/AppDropdown.vue';

import { SignOutService } from '../../../shared/services/signOut.service';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';

const signOutService = new SignOutService();
const getInstitutionByIdService = new GetInstitutionByIdService();

export default defineComponent({
  name: 'NavBar',
  components: { AppIcon, AppDropdown },

  setup() {
    const store = inject('store', AuthenticatedUserStore.state);
    const appLogo = ref<string | undefined>();
    const user = computed(() => store.user);
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const isAdmin = computed(() => !!localStorage.getItem('isAdmin'));

    const institutionId = route.params.institutionId;
    const institutionData = ref();

    fetchInstitution(institutionId);

    async function fetchInstitution(institutionId: any) {
      try {
        institutionData.value = await getInstitutionByIdService.run(institutionId);

        // Actualizar el logo una vez que se obtienen los datos
        if (institutionData.value?.institution?.logoInstitutional) {
          appLogo.value = institutionData.value.institution.logoInstitutional;
        } else {
          appLogo.value = settings.appLogo; // Logo predeterminado si no hay logo institucional
        }

        // Comprobación de la existencia de la institución
        if (!institutionData.value?.institution) {
          console.warn('Institución no encontrada. Usando colores por defecto.');
        }

        // Obtener y aplicar colores
        const colors = getInstitutionColors(institutionData.value);
        applyColors(colors);

        // Mensajes de advertencia si faltan colores
        checkColors(colors);

        console.log(appLogo.value);
      } catch (error) {
        console.error('Error al obtener la institución:', error);
      }
    }

    // Función para obtener los colores de la institución
    function getInstitutionColors(data: any) {
      return {
        primary: data?.institution?.colorPrimary ?? settings.colors.primary,
        primaryRGB: data?.institution?.colorPrimaryRgb ?? settings.colors.primaryRGB,
        secondary: data?.institution?.colorSecondary ?? settings.colors.secondary,
        secondaryRGB: data?.institution?.colorSecondaryRgb ?? settings.colors.secondaryRGB,
      };
    }

    // Aplicar colores
    function applyColors({ primary, primaryRGB, secondary, secondaryRGB }: any) {
      document.documentElement.style.setProperty('--color-primary', primary);
      document.documentElement.style.setProperty('--color-primary-rgb', primaryRGB);
      document.documentElement.style.setProperty('--color-secondary', secondary);
      document.documentElement.style.setProperty('--color-secondary-rgb', secondaryRGB);
      document.documentElement.style.setProperty('--bs-primary-rgb', primaryRGB);
    }

    // Verificar colores y emitir advertencias si faltan
    function checkColors({ primary, primaryRGB, secondary, secondaryRGB }: any) {
      if (!primary || !primaryRGB || !secondary || !secondaryRGB) {
        console.warn('No se encontraron algunos colores definidos para la institución. Usando colores por defecto.');
      }
    }

    const signOut = async () => {
      await signOutService.run();

      await router.push({
        name: 'surveys.userConvocations',
        params: { institutionId: institutionId },
      });

      window.location.reload();
    };

    return {
      institutionId,
      appLogo,
      store,
      user,
      t,

      signOut,
      isAdmin,
    };
  },
});
</script>

<style scoped>
.logo-institution {
  max-height: 60px;
}
.app-name {
  text-decoration: none;
  font-size: 1.8rem;
  font-weight: 300;
}
</style>
