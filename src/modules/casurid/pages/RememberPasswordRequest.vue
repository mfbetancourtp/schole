<template>
  <div class="d-flex flex-column w-100 h-100 justify-content-center align-items-center p-4">
    <router-link to="/" class="w-100 d-flex justify-content-center">
      <img v-if="appLogoCasurid" class="img-fluid img-main" :src="appLogoCasurid"/>
      <img v-else class="img-fluid img-main" :src="appLogo"/>
    </router-link>

    <div class="card login-container shadow-sm w-100 mt-4">
      <div class="card-body p-4">
        <form @submit.prevent="save">
          <p>Ingrese el correo electrónico para solicitar el enlace de restablecer contraseña</p>

          <AppFormField :form-control="v$.form.email" :label="'Email'">
            <input type="text" class="form-control" id="email" v-model="v$.form.email.$model"/>
          </AppFormField>

          <div class="d-grid">
            <AppButton 
              variant="primary" :disabled="loading" :label="'Solicitar enlace'"
            ></AppButton>
          </div>

          <div class="alert alert-success mt-2" v-if="!loading && success">
            Se ha enviado un correo electrónico con el enlace para restablecer la contraseña
          </div>

          <div class="text-center mt-2">
            <router-link :to="{ name: 'casurid.casuridLogin' } ">
              Iniciar sesión
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from 'vue';
import {useVuelidate} from '@vuelidate/core';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {required} from '../../../shared/plugins/vuelidate.plugin';
import {settings} from '../../../shared/constant/settings.contants';
import {PasswordChangeRequestService} from '../../auth/services/passwordChangeRequest.service';
import {useMeta} from 'vue-meta';

const passwordChangeRequestService = new PasswordChangeRequestService();

export default defineComponent({
  name: 'RememberPasswordRequest',
  components: {AppButton, AppFormField},
  setup() {
    useMeta({
      title: 'Recordar contraseña',
    });

    const appLogoCasurid = 
      window.location.host.search('casurid') != -1 || window.location.host.search('localhost') != -1 ? 
      'https://casurid.s3.us-east-2.amazonaws.com/files/static/images/logo-app.png' : '';
    const appLogo = String(settings.appLogo);

    const loading = ref(false);
    const success = ref(false);

    const form = reactive({
      email: '',
    });

    const v$ = useVuelidate({
      form: {
        email: {required},
      },
    }, {form});

    const save = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;
      loading.value = true;
      try {
        await passwordChangeRequestService.run(form.email);
        success.value = true;
      } catch (e) {
        success.value = false;
      }
      loading.value = false;
    };

    return {
      appLogoCasurid,
      appLogo,
      loading,
      success,
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
