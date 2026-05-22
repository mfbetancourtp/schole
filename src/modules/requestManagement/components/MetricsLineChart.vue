<template>
  <div class="metrics-line-chart">
    <div class="metrics-line-chart__header">
      <div class="metrics-line-chart__title-wrapper">
        <AppIcon icon="chart-line" class="metrics-line-chart__title-icon" />
        <div>
          <h3 class="metrics-line-chart__title">
            {{ t('Tendencia de Solicitudes por Mes') }}
          </h3>
          <p class="metrics-line-chart__subtitle">
            {{ t('Evolución mensual de solicitudes') }}
          </p>
        </div>
      </div>
    </div>
    <div class="metrics-line-chart__body">
      <svg :viewBox="`0 0 ${width} ${height}`" class="metrics-line-chart__svg" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        <line v-for="tick in yTicks" :key="'grid-' + tick" :x1="padding.left" :y1="getY(tick)" :x2="width - padding.right" :y2="getY(tick)" stroke="#f0f0f0" stroke-width="1" />

        <!-- Y Axis labels -->
        <text v-for="tick in yTicks" :key="'ylabel-' + tick" :x="padding.left - 8" :y="getY(tick) + 4" text-anchor="end" class="metrics-line-chart__axis-label">
          {{ tick }}
        </text>

        <!-- X Axis labels -->
        <text v-for="(item, index) in data" :key="'xlabel-' + index" :x="getX(index)" :y="height - 5" text-anchor="middle" class="metrics-line-chart__axis-label">
          {{ item.month }}
        </text>

        <!-- Total line -->
        <polyline :points="totalPoints" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        <!-- Total dots -->
        <circle v-for="(item, index) in data" :key="'total-dot-' + index" :cx="getX(index)" :cy="getY(item.total)" r="4" fill="#2563EB" stroke="#fff" stroke-width="2" />

        <!-- Approved line -->
        <polyline :points="approvedPoints" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        <!-- Approved dots -->
        <circle v-for="(item, index) in data" :key="'approved-dot-' + index" :cx="getX(index)" :cy="getY(item.approved)" r="4" fill="#10B981" stroke="#fff" stroke-width="2" />

        <!-- Rejected line -->
        <polyline :points="rejectedPoints" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        <!-- Rejected dots -->
        <circle v-for="(item, index) in data" :key="'rejected-dot-' + index" :cx="getX(index)" :cy="getY(item.rejected)" r="4" fill="#EF4444" stroke="#fff" stroke-width="2" />
      </svg>

      <!-- Legend -->
      <div class="metrics-line-chart__legend">
        <div class="metrics-line-chart__legend-item">
          <span class="metrics-line-chart__legend-dot" style="background-color: #2563eb"></span>
          <span>{{ t('Total') }}</span>
        </div>
        <div class="metrics-line-chart__legend-item">
          <span class="metrics-line-chart__legend-dot" style="background-color: #10b981"></span>
          <span>{{ t('Aprobadas') }}</span>
        </div>
        <div class="metrics-line-chart__legend-item">
          <span class="metrics-line-chart__legend-dot" style="background-color: #ef4444"></span>
          <span>{{ t('Rechazadas') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MonthlyTrend } from '../dtos/metricsAndReports.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'MetricsLineChart',
  components: { AppIcon },
  props: {
    data: { type: Array as PropType<MonthlyTrend[]>, required: true },
  },
  setup(props) {
    const { t } = useI18n();
    const width = 700;
    const height = 320;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };

    const maxValue = computed(() => {
      const max = Math.max(...props.data.map((d) => d.total));
      return Math.ceil(max / 20) * 20;
    });

    const yTicks = computed(() => {
      const max = maxValue.value;
      const step = max / 4;
      return [0, step, step * 2, step * 3, max];
    });

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getX = (index: number) => {
      const step = chartWidth / (props.data.length - 1);
      return padding.left + index * step;
    };

    const getY = (value: number) => {
      const ratio = value / maxValue.value;
      return padding.top + chartHeight - ratio * chartHeight;
    };

    const buildPoints = (key: 'total' | 'approved' | 'rejected') => computed(() => props.data.map((item, index) => `${getX(index)},${getY(item[key])}`).join(' '));

    const totalPoints = buildPoints('total');
    const approvedPoints = buildPoints('approved');
    const rejectedPoints = buildPoints('rejected');

    return {
      t,
      width,
      height,
      padding,
      yTicks,
      getX,
      getY,
      totalPoints,
      approvedPoints,
      rejectedPoints,
    };
  },
});
</script>

<style scoped>
.metrics-line-chart {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-line-chart__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.metrics-line-chart__title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metrics-line-chart__title-icon {
  font-size: 18px;
  color: #637381;
}

.metrics-line-chart__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.metrics-line-chart__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 2px 0 0;
}

.metrics-line-chart__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.metrics-line-chart__svg {
  width: 100%;
  max-height: 320px;
}

.metrics-line-chart__axis-label {
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  fill: #919eab;
}

.metrics-line-chart__legend {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.metrics-line-chart__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

.metrics-line-chart__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
