<template>
  <div class="d-flex flex-column w-100 h-100 justify-content-center align-items-center p-4">
    <router-link to="/" class="w-100 d-flex justify-content-center">
      <img class="img-main" :src="appLogo" />
    </router-link>

    <div class="card login-container shadow-sm w-100 mt-4">
      <div class="card-body p-4">
        <form @submit.prevent="save">
          <AppFormField :form-control="v$.form.password">
            <label for="password">Nueva contraseña</label>
            <input type="password" class="form-control" id="password" v-model="v$.form.password.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.passwordConfirmation">
            <label for="passwordConfirmation">Confirmar contraseña</label>
            <input type="password" class="form-control" id="passwordConfirmation" v-model="v$.form.passwordConfirmation.$model" />
          </AppFormField>

          <div class="d-grid">
            <AppButton variant="primary"> Cambiar contraseña </AppButton>
          </div>

          <div class="text-center mt-2">
            <router-link :to="{ name: 'auth.login' }"> Iniciar sesión </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useMeta } from 'vue-meta';
import { useRoute, useRouter } from 'vue-router';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { PasswordChangeProfileService } from '../services/passwordChange.service';
import { settings } from '../../../shared/constant/settings.contants';
import { required } from '../../../shared/plugins/vuelidate.plugin';

const passwordChangeService = new PasswordChangeProfileService();

export default defineComponent({
  name: 'ChangePassword',
  components: { AppButton, AppFormField },
  setup() {
    useMeta({
      title: 'Cambiar contraseña',
    });
    const appLogo = settings.appLogo;
    const route = useRoute();
    const router = useRouter();
    const token = route.query.token as string;

    const form = reactive({
      token,
      password: '',
      passwordConfirmation: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          token: { required },
          password: { required },
          passwordConfirmation: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;

      try {
        await passwordChangeService.run(form);
        await router.push({
          name: 'auth.login',
        });
      } catch (e) {
        console.error(e);
      }
    };

    return {
      appLogo,
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
</style>
