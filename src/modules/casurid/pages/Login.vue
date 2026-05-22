<template>
  <div class="d-flex flex-column w-100 h-100 justify-content-center align-items-center p-4">
    <div class="img-main-container">
      <router-link to="/">
        <img v-if="appLogoCasurid" class="img-fluid img-main" :src="appLogoCasurid"/>
        <img v-else class="img-fluid img-main" :src="appLogo"/>
      </router-link>
    </div>

    <div class="card login-container shadow-sm w-100 mt-4">
      <div class="card-body p-4">
        <AppLogin :redirect="defaultRouteRedirect" :in-casurid="true" ref="login"></AppLogin>

        <div class="d-grid">
          <button class="btn btn-primary text-white btn-block" @click="$refs.login.login">
            Iniciar sesión
          </button>
        </div>

        <div class="text-center mt-2">
          <router-link :to="{ path: '/register', query } ">
            ¿Aún no te has registrado?
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLogin from '../../../shared/components/AppLogin.vue';
import AppErrorAlert from '../../../shared/components/AppErrorAlert.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { settings } from '../../../shared/constant/settings.contants';

import { IsAuthenticatedService } from '../../../shared/services/isAuthenticated.service';

const isAuthenticatedService: IsAuthenticatedService = new IsAuthenticatedService();

export default defineComponent({
  name: 'Login',
  components: {AppLogin, AppErrorAlert, AppFormField, AppIcon},

  setup() {
    const route = useRoute();
    
    useMeta({ title: 'Iniciar sesión Casurid' });

    const allowRegistration = settings.appAllowRegistration;
    
    const appLogoCasurid = 
      window.location.host.search('casurid') != -1 || window.location.host.search('localhost') != -1 ? 
      'https://casurid.s3.us-east-2.amazonaws.com/files/static/images/logo-app.png' : '';
    let appLogo = String(settings.appLogo);

    let defaultRouteRedirect = '/';
    const query = route.query;

    const showModal = ref(false);

    if (route.query.redirectURL) {
      defaultRouteRedirect = route.query.redirectURL as string;
    }

    onMounted(() => {
      const isAuth = isAuthenticatedService.run();

      if (isAuth) {
        // await this.redirect();
      }
    });

    return {
      allowRegistration,
      appLogoCasurid,
      appLogo,

      defaultRouteRedirect,
      showModal,
      query,
    };
  },
});
</script>

<style scoped>
.login-container {
  max-width: 450px;
}

.img-main-container {
  max-height: 120px;
}

.img-main-container > a {
  max-height: inherit;
  max-width: inherit;
}

.img-main {
  max-width: 220px;
  max-height: inherit;
}
</style>
