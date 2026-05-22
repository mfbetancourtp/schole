<template>
  <div class="progress-track">
    <div class="progress-fill" :style="{ width: clampedPercent + '%' }"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'DashboardProgressBar',
  props: {
    percent: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const clampedPercent = computed(() => Math.max(0, Math.min(100, props.percent)));
    return { clampedPercent };
  },
});
</script>

<style scoped>
.progress-track {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
}

.progress-fill {
  height: 100%;
  background: #212b36;
  border-radius: 4px;
  transition: width 0.4s ease;
}
</style>
