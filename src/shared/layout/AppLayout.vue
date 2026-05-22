<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="AppLayout">
    <AppSideBarNew />

    <section class="home-section">
      <AppNavBar />
      <!-- Header global del layout -->
      <!-- <AppHeader> -->
      <!-- Punto de anclaje para acciones -->
      <!-- <template #header-actions>
          <div id="header-actions-anchor" />
        </template> -->
      <!-- </AppHeader> -->

      <!-- Contenedor scrollable con altura reactiva -->
      <div class="section_container" :style="{ height: containerHeight }">
        <router-view />
        <!-- Footer visible dentro del scroll en mobile -->
        <div class="footer_mobile">
          <AppFooter />
        </div>
      </div>

      <!-- Footer fijo (desktop) -->
      <div class="footer_desktop">
        <AppFooter />
      </div>
    </section>

    <AppRefreshTokenModal />
    <EvaluationBlockModal />
    <AppChatWidget />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

import AppNavBar from './AppNavBar.vue';
import AppFooter from './AppFooter.vue';
import AppSideBarNew from './AppSideBarNew.vue';
import AppHeader from './AppHeader.vue';
import AppRefreshTokenModal from '../components/Modal/AppRefreshTokenModal.vue';
import EvaluationBlockModal from '../../modules/evaluationTeacher/components/EvaluationBlockModal.vue';
import AppChatWidget from '../components/AppChatWidget.vue';

const containerHeight = ref('calc(100vh - 147px)');

const handleResize = () => {
  if (window.innerWidth <= 678) {
    containerHeight.value = 'calc(100vh - 64px)';
  } else {
    // 64 (NavBar) + 47 (Header) = 111; ajusta si tu Header mide diferente
    containerHeight.value = 'calc(100vh - 50px - 32px)';
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.home-section {
  position: relative;
  left: 301px;
  width: calc(100% - 301px);
  transition: all 0.5s ease;
}

:deep(.sidebar--close ~ .home-section) {
  left: 80px;
  width: calc(100% - 80px);
}

@media (max-width: 992px) {
  :deep(.sidebar--close ~ .home-section) {
    left: 0px;
    width: calc(100% - 0px);
  }
}

/* ====== Contenedor scrollable y paddings ====== */
/* .section_container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  color: #3c4248;
  overflow: auto;
} */

/* FOOTER solo desktop */
.footer_desktop {
  display: block;
  width: 100%;
}

/* FOOTER solo mobile (dentro del scroll) */
.footer_mobile {
  display: none;
  width: 100%;
  padding: 0;
  margin: 0;
}

@media (max-width: 678px) {
  .footer_desktop {
    display: none;
  }
  .footer_mobile {
    display: block;
  }

  /* .section_container {
    min-height: calc(100vh - 64px);
  } */
}
</style>
