<template>
  <div class="metrics-summary-card">
    <div class="metrics-summary-card__top">
      <div class="metrics-summary-card__icon-wrapper" :style="{ backgroundColor: iconBgColor }">
        <AppIcon :icon="icon" class="metrics-summary-card__icon" :style="{ color: iconColor }" />
      </div>
      <div class="metrics-summary-card__trend" :class="trendClass">
        <AppIcon :icon="trendIcon" class="metrics-summary-card__trend-icon" />
        <span>{{ trendDirection === 'down' ? '-' : '+' }}{{ trendPercent }}%</span>
      </div>
    </div>
    <div class="metrics-summary-card__body">
      <span class="metrics-summary-card__value">{{ formattedValue }}</span>
      <span class="metrics-summary-card__label">{{ label }}</span>
      <span class="metrics-summary-card__description">{{ description }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { TrendDirection } from '../dtos/metricsAndReports.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'MetricsSummaryCard',
  components: { AppIcon },
  props: {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    description: { type: String, default: '' },
    trendPercent: { type: Number, default: 0 },
    trendDirection: { type: String as () => TrendDirection, default: 'up' },
    icon: { type: String, default: 'file-alt' },
    iconBgColor: { type: String, default: '#EBF5FF' },
    iconColor: { type: String, default: '#2563EB' },
  },
  setup(props) {
    const trendClass = computed(() => ({
      'metrics-summary-card__trend--up': props.trendDirection === 'up',
      'metrics-summary-card__trend--down': props.trendDirection === 'down',
    }));

    const trendIcon = computed(() => (props.trendDirection === 'up' ? 'arrow-up' : 'arrow-down'));

    const formattedValue = computed(() => props.value.toLocaleString('es-CO'));

    return { trendClass, trendIcon, formattedValue };
  },
});
</script>

<style scoped>
.metrics-summary-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.metrics-summary-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metrics-summary-card__icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metrics-summary-card__icon {
  font-size: 20px;
}

.metrics-summary-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.metrics-summary-card__trend--up {
  color: #10b981;
}

.metrics-summary-card__trend--down {
  color: #ef4444;
}

.metrics-summary-card__trend-icon {
  font-size: 12px;
}

.metrics-summary-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metrics-summary-card__value {
  font-family: 'Roboto', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #212b36;
  line-height: 1.2;
}

.metrics-summary-card__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #212b36;
}

.metrics-summary-card__description {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
  margin-top: 2px;
}
</style>
