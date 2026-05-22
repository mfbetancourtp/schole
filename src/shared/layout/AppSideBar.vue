<template>
  <div class="o-sidebar">
    <div class="o-logo" :class="{ 'small-logo': !showSideBar }">
      <router-link to="/">
        <img :src="appLogo" class="" />
      </router-link>
    </div>
    <div class="o-sidebar-wrapper">
      <div class="o-user-panel">
        <div class="o-dropdown">
          <a
            href="#"
            class="o-dropdown-user"
            :class="{ 'small-dropdown': !showSideBar }"
            id="dropdownUser2"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <AppAvatar
              :avatar="user.avatar"
              :name="user.people.names"
              size="lg"
              :class="{ 'small-avatar': !showSideBar }"
            ></AppAvatar>
          </a>
          <ul
            class="dropdown-menu o-dropdown-menu"
            :class="{ 'small-dropdown-menu': !showSideBar }"
            aria-labelledby="dropdownUser2"
          >
            <li>
              <router-link
                class="o-dropdown-item"
                :class="{ 'small-item': !showSideBar }"
                :to="{ name: 'access.profile' }"
              >
                <AppIcon class="" icon="user-circle"></AppIcon>
                <span v-if="showSideBar" class="o-dropdown-item-title"
                  >Perfil</span
                >
              </router-link>
            </li>
            <li>
              <hr class="dropdown-divider" />
            </li>
            <li>
              <button
                class="o-dropdown-item"
                type="button"
                :class="{ 'small-item': !showSideBar }"
                @click="signOut"
              >
                <AppIcon class="" icon="sign-out-alt"></AppIcon>
                <span v-if="showSideBar" class="o-dropdown-item-title"
                  >Cerrar sesión</span
                >
              </button>
            </li>
          </ul>
        </div>

        <span
          class="text-truncate w-100"
          :class="{ 'small-menu-none': !showSideBar }"
        >
          {{ user.people.names }} {{ user.people.lastnames }}
        </span>

        <span
          class="text-truncate w-100"
          v-if="institutions.length === 1 && institution"
        >
          {{ institution.name }}
        </span>

        <v-select
          :class="{ 'small-menu-none': !showSideBar }"
          class="o-select"
          :options="institutions"
          label="name"
          :reduce="(d) => d.id"
          v-model="currentInstitution"
        ></v-select>
      </div>

      <div class="o-modules">
        <template v-for="item in items">
          <div
            v-if="item.children.length"
            class="o-module-item"
            :class="{ expanded: itemsExpanded == item.id }"
            :key="item.id"
          >
            <div
              @click="toggleMenu(item)"
              class="o-module-item-wrapper"
              :class="{ active: itemsExpanded == item.id }"
            >
              <div class="o-content-left">
                <AppIcon
                  :icon="item.icon"
                  class="items-icons"
                  :class="{ expanded: itemsExpanded == item.id }"
                />
                <span
                  class="title"
                  :class="{ 'small-menu-none': !showSideBar }"
                >
                  {{ t(item.title) }}
                </span>
              </div>
              <div class="o-content-right">
                <AppIcon
                  icon="angle-down"
                  class="items-icons"
                  :class="{
                    expanded: itemsExpanded == item.id,
                    'small-menu': !showSideBar,
                  }"
                />
              </div>
            </div>
            <div
              class="o-module-subitems-container"
              :class="{ 'small-menu': !showSideBar }"
              v-if="itemsExpanded == item.id"
            >
              <div
                v-for="(child, index) in item.children"
                class="o-module-subitem"
                :key="index"
              >
                <div class="o-module-item-wrapper">
                  <AppLinkNavigation
                    :title="child.title"
                    :link="child.link"
                    :class="{ 'small-menu-nav': !showSideBar }"
                  ></AppLinkNavigation>
                </div>
              </div>
              <hr class="o-line-horizontal" v-if="showSideBar" />
            </div>
          </div>

          <div
            v-else
            class="o-module-item"
            :class="{ expanded: itemsExpanded == item.id }"
            v-bind:key="item.id"
          >
            <div
              class="o-module-item-wrapper"
              @click="toggleMenu(item)"
              :class="{ active: itemsExpanded == item.id }"
            >
              <div class="o-content-left">
                <AppIcon
                  :icon="item.icon"
                  class="items-icons"
                  :class="{ expanded: itemsExpanded == item.id }"
                />
                <span
                  class="title"
                  style="width:190px"
                  :class="{ 'small-menu-none': !showSideBar }"
                >
                  <AppLinkNavigation
                    class="o-home-nav-link"
                    :class="{ 'link-show': itemsExpanded == item.id }"
                    :title="item.title"
                    :link="item.link"
                  ></AppLinkNavigation>
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  Ref,
  ref,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";

import NavigationStore from "../stores/navigation.store";
import AppLinkNavigation from "../components/AppLinkNavigation.vue";
import AppIcon from "../components/AppIcon.vue";

import { SignOutService } from "../services/signOut.service";
import { settings } from "../constant/settings.contants";
import AuthenticatedUserStore from "../stores/authenticatedUser.store";
import { InstitutionsService } from "../services/institutions.service";
import { InstitutionDto } from "../dto/institution.dto";
import AppAvatar from "../components/AppAvatar.vue";
import { ItemMenuType } from "../types/itemMenu.type";

const signOutService = new SignOutService();
const institutionsService = new InstitutionsService();

export default defineComponent({
  components: { AppAvatar, AppLinkNavigation, AppIcon },
  props: ["showSideBar"],
  setup() {
    const state = inject("state", NavigationStore.state);
    const stateUser = inject("stateUser", AuthenticatedUserStore.state);

    const { t } = useI18n();
    const appLogo = settings.appLogo;

    const items = computed(() => state.items);
    const institutions = ref<InstitutionDto[]>(
      institutionsService.getInstitutions()
    );
    const currentInstitution = ref<number | null>(null);
    const itemsExpanded = ref<any>(null);

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
        institutionsService.setSelectedInstitutions(
          institutions.value.find(
            (institution) => institution.id === value
          ) as InstitutionDto
        );
        window.location.reload();
      }
    });

    const toggleMenu = (item: ItemMenuType) => {
      itemsExpanded.value = itemsExpanded.value == item.id ? null : item.id;
    };
    const reload = () => {
      window.location.reload();
    };
    console.log(items)

    return {
      state,
      items,
      appLogo,
      t,
      user,
      institution,
      institutions,
      currentInstitution,
      itemsExpanded,
      /*show,*/
      toggleMenu,
      signOut,
      reload,
    };
  },
});
</script>

<style scoped>
.o-sidebar {
  display: block;
  width: var(--sidebar-width);
  background-color: var(--color-light);
  height: var(--sidebar-height);
  position: fixed;
  z-index: 20;
  overflow-y: auto;
  transition: margin;
  transition: all 0.5s ease;
}
@media (max-width: 500px) {
  .o-sidebar {
    width: 100%;
  }
}
.o-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 90px;
  padding: var(--padding-1);
  transition: all 0.5s ease;
}
.o-logo > a,
img {
  max-height: inherit;
  max-width: 200px;
}

.main-item {
  font-size: 0.75rem;
}
.o-select {
  width: 100%;
}

.o-select > div {
  border-radius: 2rem;
}

.o-user-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--gap-1);
  padding-left: var(--padding-5);
  padding-right: var(--padding-5);
  text-align: center;
}

.o-dropdown-user {
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-decoration: none;
}

.o-dropdown-user::after,
.o-sidebar:hover .o-dropdown-user.small-dropdown::after {
  display: inline-block;
  margin-left: 0.3rem;
  vertical-align: 0.3rem;
  content: "";
  border-top: 0.3rem solid;
  border-right: 0.3rem solid transparent;
  border-bottom: 0;
  border-left: 0.3rem solid transparent;
  color: var(--color-gray-600);
  transition: all 0.5 ease;
}

.o-dropdown-menu {
  position: absolute;
  z-index: 999;
  display: none;
  padding: var(--padding-1) 0;
  margin: 0;
  font-size: var(--font-size-2);
  color: var(--color-gray-900);
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: var(--border-radius-3);
  min-width: 40%;
}

.o-dropdown-item {
  display: block;
  width: 100%;
  padding: var(--padding-2);
  font-weight: var(--font-weight-normal);
  color: var(--color-gray-900);
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  border-radius: var(--border-radius-3);
}
.o-dropdown-item-title {
  margin-left: var(--margin-1);
}
.o-dropdown-menu.show {
  display: flex;
  flex-direction: column;
}
.small-item {
  padding: 0 1rem !important;
}
.small-dropdown-menu {
  align-items: center;
  transform: translate3d(50px, 83px, 0px) !important;
}
.o-dropdown-item.small-item:hover {
  border-radius: 999px;
  background-color: transparent;
}

.o-modules {
  display: flex;
  flex-direction: column;
  gap: var(--gap-1);
  padding: 1rem 0;
  transition: all 2s ease;
}

.o-line-horizontal {
  opacity: var(--opacity-color-40);
  background-color: transparent;
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.8),
    transparent
  );
}
.o-module-item {
  position: relative;
}

.o-module-item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding-left: var(--padding-5);
  padding-right: var(--padding-3);
  font-size: var(--font-size-1);
  box-sizing: border-box;
  margin: 0 0.5rem;
  cursor: pointer;
}
.o-module-item-wrapper:hover {
  border-radius: var(--border-radius-1);
  background-color: rgba(var(--color-primary-rgb), var(--opacity-color-10));
  cursor: pointer;
}
.o-module-item-wrapper.active {
  border-radius: var(--border-radius-1);
  color: var(--color-light);
  font-weight: var(--font-weight-semibold);
  background-color: var(--color-primary);
  margin-bottom: var(--margin-bottom-1);
}

.o-content-left,
.o-content-right {
  display: flex;
  align-items: center;
  gap: var(--gap-1);
}
.items-icons {
  font-size: var(--font-size-2);
  color: rgba(var(--color-gray-600-rgb), var(--opacity-color-100));
  transition: all 0.3s ease;
}
.o-content-left .items-icons.expanded {
  color: var(--color-light);
  transform: none;
}
.items-icons.small-menu {
  display: none;
}
.items-icons.expanded {
  transform: rotate(180deg);
  color: var(--color-light);
}
.o-active.o-home-nav-link.link-show{
  color: rgb(255, 255, 255);
}

@media (min-width: 992px) {
  .o-sidebar:hover .o-logo {
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 90px;
    padding: var(--padding-1);
    transition: all 0.5s ease;
  }
  .small-menu-none {
    display: none;
  }
  .o-module-subitems-container.small-menu {
    display: none;
  }
  .small-logo {
    max-height: 2.5rem;
  }

  .small-avatar {
    width: 3rem;
    height: 3rem;
  }
  .o-dropdown-user.small-dropdown::after {
    border-top: 0.2rem solid;
    border-right: 0.2rem solid transparent;
    border-left: 0.2rem solid transparent;
    color: var(--color-gray-600);
  }
  .o-sidebar:hover {
    width: var(--sidebar-width);
  }
  .o-sidebar:hover .small-menu-nav {
    font-size: var(--font-size-1);
  }
  .o-sidebar:hover .o-module-subitems-container.small-menu {
    display: block;
  }
  .o-sidebar:hover .o-avatar {
    width: 5rem;
    height: 5rem;
  }
  .o-sidebar:hover .small-menu-none {
    display: initial;
  }
  .o-sidebar:hover .items-icons.small-menu {
    display: block;
  }
  .small-menu-nav::first-letter {
    font-size: var(--font-size-1);
  }
  .small-menu-nav {
    font-size: 0;
    transition: all 0.2s ease;
  }
}
</style>
