<template>
  <nav class="navbar navbar-light bg-light shadow-sm px-3 justify-content-between">
    <div>
      <router-link to="/" class="app-name">
        <img v-if="appLogoCasurid" :src="appLogoCasurid" class="img-fluid logo-institution">
        <img v-else :src="appLogo" class="img-fluid logo-institution">
      </router-link>
    </div>

    <div class="d-flex gap-2">
      <button class="d-block d-lg-none btn" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" v-if="user">
        <AppIcon icon="bars"/>
      </button>

      <router-link to="/shopping-cart" class="d-none d-lg-block btn" v-tooltip="'Carrito de compras'">
        <AppIcon icon="shopping-cart" class="text-primary" size="lg"/>
      </router-link>

      <router-link v-if="adminCasuridUser()" to="/admin/home" class="d-none d-lg-block btn" v-tooltip="'Administración'">
        <AppIcon icon="user-cog" class="text-primary" size="lg"/>
      </router-link>

      <router-link 
        v-if="!user" to="/portal/login" class="btn"
        v-tooltip="'Iniciar sesión'" type="button"
      >
        <AppIcon icon="sign-in-alt" class="me-2 text-primary" size="lg"/>
      </router-link>

      <router-link v-if="!user" to="/register" class="btn btn-primary text-white" type="button">
        Registrarse
      </router-link>

      <AppDropdown v-else>
        <template v-slot:button>
          <button type="button" class="btn">
            <AppIcon icon="user-circle" class="text-primary" size="lg"/>
          </button>
        </template>

        <template v-slot:items>
          <li>
            <router-link class="dropdown-item" type="button" :to="{ name: 'casurid.profile' }">
              <AppIcon icon="user" class="me-2 text-primary"></AppIcon>
              Perfil
            </router-link>
            <router-link class="dropdown-item" type="button" to="/shopping">
              <AppIcon icon="shopping-bag" class="me-2 text-primary"></AppIcon>
              Mis compras
            </router-link>
            <router-link class="dropdown-item" type="button" to="/my-quotas">
              <AppIcon icon="credit-card" class="me-2 text-primary"></AppIcon>
              Mis cuotas
            </router-link>

            <!-- <router-link v-if="adminCasuridUser()" class="dropdown-item" type="button" to="/admin/home">
              <AppIcon icon="user-cog" class="me-2 text-primary"></AppIcon>
              Administración
            </router-link> -->

            <hr>

            <button class="dropdown-item" type="button" @click="signOut">
              <AppIcon icon="sign-out-alt" class="me-2 text-primary"></AppIcon>
              Cerrar sesión
            </button>
          </li>
        </template>
      </AppDropdown>
    </div>

    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
      <div class="d-flex flex-column flex-shrink-0 pb-3 bg-light h-100">

        <ul class="nav nav-pills flex-column mb-auto px-3 pt-4">

          <li class="nav-item mt-2">
            <router-link to="/" class="nav-link"
                         :class="{ active: isActive('/'), 'text-secondary': !isActive('/')}">
              <AppIcon icon="home" size="lg" class="me-2"/>
              Inicio
            </router-link>
          </li>

          <li class="nav-item mt-2">
            <router-link to="/shopping-cart" class="nav-link"
                         :class="{ active: isActive('/shopping-cart'), 'text-secondary': !isActive('/shopping-cart')}">
              <AppIcon icon="shopping-cart" size="lg" class="me-2"/>
              Carrito de compras
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <AppModal v-model="showLogin" @close="showLogin = false">
      <LoginCasurid v-if="showLogin"></LoginCasurid>
    </AppModal>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue';

import LoginCasurid from './LoginCasurid.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppDropdown from '../../../shared/components/AppDropdown.vue';

import AuthenticatedUserStore from '../../../shared/stores/authenticatedUser.store';

import { settings } from '../../../shared/constant/settings.contants';

import { SignOutService } from '../../../shared/services/signOut.service';

const signOutService = new SignOutService();

export default defineComponent({
  name: 'NavBar',
  components: {AppDropdown, LoginCasurid, AppModal, AppIcon},

  setup() {
    const store = inject('store', AuthenticatedUserStore.state);

    const appLogoCasurid = 
      window.location.host.search('casurid') != -1 || window.location.host.search('localhost') != -1 ? 
      'https://casurid.s3.us-east-2.amazonaws.com/files/static/images/logo-app.png' : '';
    const appLogo = String(settings.appLogo);

    const user = computed(() => store.user);

    const adminCasuridUser = () => {
      const roles: any[] = JSON.parse(localStorage.getItem('roles') ?? '[]');
      const isSuperAdmin: boolean = !!roles.filter(rol => rol.profile.code == 'adminCasurid').length;

      return isSuperAdmin;
    };

    return {
      appLogoCasurid,
      appLogo,
      store,
      user,

      adminCasuridUser,
    };
  },

  data() {
    return {
      showLogin: false,
    };
  },

  methods: {
    isActive(route: string) {
      return route == this.$route.path;
    },

    openModalLogin() {
      this.showLogin = true;
    },

    signOut() {
      signOutService.run();
      window.location.reload();
    },
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
