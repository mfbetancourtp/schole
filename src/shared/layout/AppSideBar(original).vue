<template>
  <div class="sidebar d-flex flex-column flex-shrink-0 pb-3 h-100" style="">
    <div class="logo d-flex justify-content-center align-items-center p-3">
      <router-link to="/">
        <img :src="appLogo" class="p-3">
      </router-link>
    </div>
    <div class="d-flex flex-column h-100">
      <div class="d-flex flex-column justify-content-center align-items-center gap-2 px-4 text-center">
        <div class="dropdown">
          <a href="#" class="d-flex align-items-center link-dark text-decoration-none dropdown-toggle"
             id="dropdownUser2"
             data-bs-toggle="dropdown" aria-expanded="false">
            <AppAvatar :avatar="user.avatar" :name="user.people.names" size="lg"></AppAvatar>
          </a>
          <ul class="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
            <li>
              <router-link class="dropdown-item" :to="{ name:'access.profile' }">
                <AppIcon class="me-2" icon="user-circle"></AppIcon>
                Perfil
              </router-link>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <button class="dropdown-item" type="button" @click="signOut">
                <AppIcon class="me-2" icon="sign-out-alt"></AppIcon>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>

        <span class="text-truncate w-100">
          {{ user.people.names }} {{ user.people.lastnames }}
        </span>

        <span class="text-truncate w-100" v-if="institutions.length === 1 && institution">
          {{ institution.name }}
        </span>

        <v-select v-else class="w-100" :options="institutions" label="name" :reduce="d => d.id"
                  v-model="currentInstitution"></v-select>

      </div>
      <ul class="nav nav-pills flex-column mb-auto px-3 pt-4">
        <template v-for="(item, index) in items" :key="index">
          <li v-if="item.children.length" class="nav-item mt-4 tesxt-secondary text-uppercase main-item">
            {{ t(item.title) }}
          </li>
          <li v-else class="nav-item mt-2">
            <AppLinkNavigation :title="item.title" :icon="item.icon" :link="item.link"></AppLinkNavigation>
          </li>

          <li v-for="(child, index) in item.children" :key="index"  class="nav-item mt-2">
            <AppLinkNavigation :title="child.title" :icon="child.icon" :link="child.link"></AppLinkNavigation>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, inject, onMounted, Ref, ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';

import NavigationStore from '../stores/navigation.store';
import AppLinkNavigation from '../components/AppLinkNavigation.vue';
import AppIcon from '../components/AppIcon.vue';

import {SignOutService} from '../services/signOut.service';
import {settings} from '../constant/settings.contants';
import AuthenticatedUserStore from '../stores/authenticatedUser.store';
import {InstitutionsService} from '../services/institutions.service';
import {InstitutionDto} from '../dto/institution.dto';
import AppAvatar from '../components/AppAvatar.vue';

const signOutService = new SignOutService();
const institutionsService = new InstitutionsService();

export default defineComponent({
  components: {AppAvatar, AppLinkNavigation, AppIcon},
  setup() {
    const state = inject('state', NavigationStore.state);
    const stateUser = inject('stateUser', AuthenticatedUserStore.state);

    const {t} = useI18n();
    const appLogo = settings.appLogo;

    const items = computed(() => state.items);
    const institutions = ref<InstitutionDto[]>(institutionsService.getInstitutions());
    const currentInstitution = ref<number | null>(null);

    const signOut = () => {
      signOutService.run();
      window.location.reload();
    };

    const user = computed(() => stateUser.user);
    const institution: Ref<InstitutionDto | null> = ref(null);

    onMounted(() => {
      institution.value = institutionsService.getSelectedInstitution();

      if (institution.value) {
        currentInstitution.value = institution.value.id as number;
      }
    });

    watch(currentInstitution, (value) => {
      if (value !== institution.value?.id) {
        institutionsService.setSelectedInstitutions(institutions.value.find((institution) => institution.id === value) as InstitutionDto);
        window.location.reload();
      }
    });

    return {
      signOut,
      state,
      items,
      appLogo,
      t,
      user,
      institution,
      institutions,
      currentInstitution,
    };
  },
});

</script>

<style scoped>
.logo {
  max-height: 90px;
}

.logo > a {
  max-height: inherit;
  max-width: inherit;
}

.logo > a > img {
  max-height: inherit;
  max-width: inherit;
}

.main-avatar {
  width: 5rem;
  height: 5rem;
}

.main-item {
  font-size: .75rem;
}

.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bs-light);
  height: 100vh;
  position: fixed;
  overflow: auto;
}
@media (max-width: 500px) {
  .sidebar {
    width: 100%;
  }
}
</style>
