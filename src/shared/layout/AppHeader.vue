<template>
  <header class="header">
    <div class="header-content">
      <div class="content-text">
        <router-link :to="headerStorage.module.url ? headerStorage.module.url : ''">
          {{ t(headerStorage.module.name ? headerStorage.module.name : '') }}
        </router-link>
        <router-link :to="headerStorage.moduleItem.url ? headerStorage.moduleItem.url : ''">
          {{ headerStorage.moduleItem.name ? ' / ' + t(headerStorage.moduleItem.name) : '' }}
        </router-link>
        <router-link :to="headerStorage.moduleSubItem.url ? headerStorage.moduleSubItem.url : ''">
          {{ headerStorage.moduleSubItem.name ? ' / ' + t(headerStorage.moduleSubItem.name) : '' }}
        </router-link>
      </div>
    </div>
    <div class="header-buttons">
      <slot name="header-actions"></slot>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useHeaderStore } from '../../stores/header.store';
import { useI18n } from 'vue-i18n';
import { useSidebarStore } from '../../stores/sidebar.store';
import AppGetIcon from '../components/AppGetIcon.vue';

// import AppGetIcon from '../components/AppGetIcon.vue';

export default defineComponent({
  name: 'AppHeader',
  // components: { AppGetIcon },
  setup() {
    const { t } = useI18n();
    const headerStorage = useHeaderStore();
    const sidebarStorage = useSidebarStore();
    onMounted(() => {
      // Agregar confirmación antes de retroceder en el historial de navegación
      // window.onbeforeunload = () => true;
    });
    const goBack = () => {
      // window.history.back();
    };
    return {
      t,
      goBack,
      headerStorage,
      sidebarStorage,
    };
  },
  components: { AppGetIcon },
});
</script>

<style scoped>
.button-arrow {
  /* position: fixed;
  top: -7px;
  left: -12px;
  display: flex; */
  color: var(--color-light);
  background: var(--color-secondary);
  border-radius: var(--border-radius-2);
  transform: translate3d(-29px, 0px, 0px);
  transition: all 0.5s ease;
}
.content-button {
  width: 100%;
  height: 100%;
  transform: rotate(270deg);
}
.buttons--close {
  transform: translate3d(-29px, 0px, 0px);
  left: 11px;
}
.buttons--close .content-button {
  transform: rotate(90deg);
}

.header {
  width: 100%;
  min-height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem 0.5rem 2rem;
  background: var(--color-primary);
  color: #ffffff;
  flex-wrap: wrap;
  gap: 10px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.header-content a {
  text-decoration: none;
  color: #ffffff;
}
@media (min-width: 501px) {
  .buttons {
    display: none;
  }
  .button:focus {
    box-shadow: 0 0 0 0.15rem white;
    border-radius: 0.25rem;
  }
}
@media (max-width: 500px) {
  .button-arrow {
    display: none;
  }
}
@media (max-width: 992px) {
  .buttons--close {
    transform: translate3d(0px, 0px, 0px);
    left: 3px;
  }
  .header {
  padding: 0.5rem 1rem 0.5rem 2.7rem;

}
}
</style>
