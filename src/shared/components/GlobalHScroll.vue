<template>
  <div
    v-if="store.enabled"
    class="GlobalHScroll"
    :class="{ 'is-fixed': fixed }"
    :style="fixed ? { bottom: (bottomOffset ?? 12) + 'px' } : undefined"
    ref="bar"
    @scroll="onBarScroll"
  >
    <div :style="{ width: spacerWidth + 'px', height: '1px' }"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useHScrollStore } from '../../stores/hscroll.store';

const props = defineProps<{ fixed?: boolean; bottomOffset?: number }>();

const store = useHScrollStore();
const bar = ref<HTMLDivElement | null>(null);

const spacerWidth = computed(() => {
  const viewW = store.el?.clientWidth ?? 0;
  const contentW = store.width ?? 0;
  return Math.max(contentW, viewW || 1);
});

let syncing = false;
let ro: ResizeObserver | null = null;

const onBarScroll = () => {
  if (syncing) return;
  syncing = true;
  store.setLeftFromBar(bar.value?.scrollLeft ?? 0);
  requestAnimationFrame(() => (syncing = false));
};

watch(() => store.left, (val) => {
  if (!bar.value || syncing) return;
  if (bar.value.scrollLeft !== val) {
    syncing = true;
    bar.value.scrollLeft = val;
    requestAnimationFrame(() => (syncing = false));
  }
});

watch(() => store.el, (el) => {
  ro?.disconnect();
  if (!bar.value) return;
  bar.value.scrollLeft = el?.scrollLeft ?? 0;
  if (el) {
    ro = new ResizeObserver(() => store.updateFromEl());
    try { ro.observe(el); } catch {}
  }
});

onMounted(() => {
  if (store.el && bar.value) bar.value.scrollLeft = store.el.scrollLeft;
});
onUnmounted(() => { ro?.disconnect(); });
</script>

<style scoped>
.GlobalHScroll{
  width:100%;
  overflow-x:auto;
  overflow-y:hidden;
  -webkit-overflow-scrolling:touch;
  scrollbar-gutter:stable;
  background:#f5f5f5;
  border-radius:8px;
}
.GlobalHScroll::-webkit-scrollbar{ height:8px; }
.GlobalHScroll::-webkit-scrollbar-thumb{ background:#bdbdbd; border-radius:8px; }

/* Modo fijo para pantalla completa */
.is-fixed{
  position: fixed;
  left: 0;
  right: 0;
  /* bottom lo controla :style con bottomOffset */
  z-index: 203; /* > 201 de tu overlay */
  padding: 4px 8px;
}
</style>
