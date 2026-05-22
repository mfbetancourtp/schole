<template>
  <div class="metrics-pie-chart">
    <div class="metrics-pie-chart__header">
      <div class="metrics-pie-chart__title-wrapper">
        <AppIcon icon="chart-pie" class="metrics-pie-chart__title-icon" />
        <div>
          <h3 class="metrics-pie-chart__title">
            {{ t('Estados de Solicitudes') }}
          </h3>
          <p class="metrics-pie-chart__subtitle">
            {{ t('Distribución por estado actual') }}
          </p>
        </div>
      </div>
    </div>
    <div class="metrics-pie-chart__body">
      <div class="metrics-pie-chart__chart-area">
        <svg viewBox="0 0 200 200" class="metrics-pie-chart__svg">
          <circle
            v-for="(segment, index) in segments"
            :key="index"
            cx="100"
            cy="100"
            r="80"
            fill="none"
            :stroke="segment.color"
            stroke-width="40"
            :stroke-dasharray="segment.dashArray"
            :stroke-dashoffset="segment.dashOffset"
            class="metrics-pie-chart__segment"
          />
        </svg>
      </div>
      <div class="metrics-pie-chart__legend">
        <div v-for="item in data" :key="item.status" class="metrics-pie-chart__legend-item">
          <span class="metrics-pie-chart__legend-dot" :style="{ backgroundColor: item.color }"></span>
          <span class="metrics-pie-chart__legend-label">{{ item.status }}: {{ item.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RequestsByStatus } from '../dtos/metricsAndReports.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'MetricsPieChart',
  components: { AppIcon },
  props: {
    data: { type: Array as PropType<RequestsByStatus[]>, required: true },
  },
  setup(props) {
    const { t } = useI18n();
    const circumference = 2 * Math.PI * 80;

    const segments = computed(() => {
      let accumulatedOffset = 0;
      return props.data.map((item) => {
        const dashLength = (item.percentage / 100) * circumference;
        const gapLength = circumference - dashLength;
        const dashOffset = -accumulatedOffset;
        accumulatedOffset += dashLength;
        return {
          color: item.color,
          dashArray: `${dashLength} ${gapLength}`,
          dashOffset: dashOffset,
        };
      });
    });

    return { t, segments };
  },
});
</script>

<style scoped>
.metrics-pie-chart {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-pie-chart__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.metrics-pie-chart__title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metrics-pie-chart__title-icon {
  font-size: 18px;
  color: #637381;
}

.metrics-pie-chart__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.metrics-pie-chart__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 2px 0 0;
}

.metrics-pie-chart__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.metrics-pie-chart__chart-area {
  width: 200px;
  height: 200px;
}

.metrics-pie-chart__svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.metrics-pie-chart__segment {
  transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;
}

.metrics-pie-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.metrics-pie-chart__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metrics-pie-chart__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.metrics-pie-chart__legend-label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}
</style>
