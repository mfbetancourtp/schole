<template>
  <div class="chart-card">
    <h4 class="chart-title">{{ title }}</h4>
    <p class="chart-subtitle">{{ subtitle }}</p>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AnalyticsChartCard',

  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  },
});
</script>

<style scoped>
.chart-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  height: 100%;
}

.chart-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.15rem;
}

.chart-subtitle {
  font-size: 0.78rem;
  color: #2563eb;
  margin-bottom: 0.75rem;
}
</style>
