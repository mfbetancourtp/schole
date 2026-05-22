<template>
  <div class="d-flex flex-column w-100 h-100 justify-content-center align-items-center p-4">
    <a href="/" class="w-100 d-flex justify-content-center">
      <img class="img-main" :src="appLogo" />
    </a>

    <div class="card login-container shadow-sm w-100 mt-4">
      <div class="card-body p-4">
        <p class="text-center">Por seguridad, debes cambiar tu contraseña en tu primer ingreso. Ingresa tu contraseña actual y establece una nueva.</p>
        <ChangePasswordLoggedForm @close="redirectToDefault"></ChangePasswordLoggedForm>
        <div class="text-center mt-2">
          <router-link :to="{ name: 'auth.login' }"> Iniciar sesión </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';
import { settings } from '../../../shared/constant/settings.contants';
import { useRouter } from 'vue-router';
import ChangePasswordLoggedForm from '../components/ChangePasswordLoggedForm.vue';
import { SignOutService } from '../../../shared/services/signOut.service';

export default defineComponent({
  name: 'ChangePasswordProfileForm',
  components: { ChangePasswordLoggedForm },
  setup() {
    useMeta({
      title: 'Cambiar contraseña',
    });
    const appLogo = settings.appLogo;
    const router = useRouter();
    const redirectToDefault = async () => {
      const signOutService = new SignOutService();
      try {
        signOutService.run();
        await router.push({
          name: 'auth.login',
        });
      } catch (e) {
        console.error(e);
      }
    };
    return {
      appLogo,
      redirectToDefault,
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
.cards-form-form {
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.18);
  border-radius: 20px;
}
:deep(.card-body .content-new-password) {
  display: block;
}
:deep(.card-body .button-save) {
  justify-content: center !important;
}
</style>
