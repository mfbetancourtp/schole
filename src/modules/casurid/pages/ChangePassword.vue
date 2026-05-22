<template>
  <div class="d-flex flex-column w-100 h-100 justify-content-center align-items-center p-4">
    <router-link to="/" class="w-100 d-flex justify-content-center">
      <img v-if="appLogoCasurid" class="img-fluid img-main" :src="appLogoCasurid" />
      <img v-else class="img-fluid img-main" :src="appLogo" />
    </router-link>

    <div class="card login-container shadow-sm w-100 mt-4">
      <div class="card-body p-4">
        <form @submit.prevent="save">
          <AppFormField :form-control="v$.form.password">
            <label for="password">Contraseña</label>
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
            <router-link :to="{ name: 'casurid.casuridLogin' }"> Iniciar sesión </router-link>
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

import { PasswordChangeProfileService } from '../../auth/services/passwordChange.service';
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

    const appLogoCasurid =
      window.location.host.search('casurid') != -1 || window.location.host.search('localhost') != -1 ? 'https://casurid.s3.us-east-2.amazonaws.com/files/static/images/logo-app.png' : '';
    const appLogo = String(settings.appLogo);

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
          name: 'casurid.casuridLogin',
        });
      } catch (e) {
        console.log(e);
      }
    };

    return {
      appLogoCasurid,
      appLogo,
      save,
      v$,
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
