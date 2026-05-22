<template>
  <footer class="AppFooter">
    <div class="AppFooter__left">
      <img :src="appLogo?.toString()" class="AppFooter__logo-img" />
      <span class="Version">Versión 3.0</span>
    </div>
    <GlobalHScroll />
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { settings } from '../constant/settings.contants';
import GlobalHScroll from '../components/GlobalHScroll.vue';

export default defineComponent({
  name: 'AppFooter',
  components: { GlobalHScroll },
  setup() {
    const appLogo = settings.appLogo;
    return { appLogo };
  },
});
</script>

<style scoped>
.AppFooter {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 12px;
  padding: 5px var(--padding-2);
}

.AppFooter__left {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 6px;
}

.AppFooter__logo-img {
  height: 20px;
  width: auto;
  object-fit: contain;
}

.AppFooter :deep(.GlobalHScroll) {
  flex: 1;
  min-width: 0;
}

.Version {
  font-style: italic;
  font-weight: 400;
  font-size: 9px;
  line-height: 1;
  white-space: nowrap;
  color: #aaa;
  margin-top: 2px;
}
</style>
