<template>
  <div class="kpi-card">
    <div>
      <p class="kpi-label">{{ label }}</p>
      <p class="kpi-value">{{ value }}</p>
    </div>
    <span class="kpi-icon" :class="`kpi-icon--${iconVariant}`">
      <AppIcon :icon="icon" />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'AnalyticsKpiCard',

  components: { AppIcon },

  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    icon: { type: String, required: true },
    iconVariant: { type: String, default: 'blue' },
  },
});
</script>

<style scoped>
.kpi-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  height: 100%;
}

.kpi-label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
  margin: 0;
}

.kpi-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.kpi-icon--blue {
  background: #eff6ff;
  color: #2563eb;
}
.kpi-icon--green {
  background: #f0fdf4;
  color: #16a34a;
}
.kpi-icon--purple {
  background: #faf5ff;
  color: #9333ea;
}
.kpi-icon--blue-light {
  background: #e0f2fe;
  color: #0284c7;
}
.kpi-icon--orange {
  background: #fff7ed;
  color: #ea580c;
}
</style>
