<template>
  <div class="metrics-bar-chart">
    <div class="metrics-bar-chart__header">
      <div class="metrics-bar-chart__title-wrapper">
        <AppIcon icon="chart-bar" class="metrics-bar-chart__title-icon" />
        <div>
          <h3 class="metrics-bar-chart__title">
            {{ t('Solicitudes por Tipo') }}
          </h3>
          <p class="metrics-bar-chart__subtitle">
            {{ t('Distribución de tipos de solicitud') }}
          </p>
        </div>
      </div>
    </div>
    <div class="metrics-bar-chart__body">
      <div class="metrics-bar-chart__chart">
        <div class="metrics-bar-chart__y-axis">
          <span v-for="tick in yTicks" :key="tick" class="metrics-bar-chart__y-tick">{{ tick }}</span>
        </div>
        <div class="metrics-bar-chart__bars-container">
          <div v-for="item in data" :key="item.type" class="metrics-bar-chart__bar-group">
            <div class="metrics-bar-chart__bar-wrapper">
              <div
                class="metrics-bar-chart__bar"
                :style="{
                  height: getBarHeight(item.count),
                  backgroundColor: item.color,
                }"
              >
                <span class="metrics-bar-chart__bar-value">{{ item.count }}</span>
              </div>
            </div>
            <span class="metrics-bar-chart__bar-label">{{ item.type }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RequestsByType } from '../dtos/metricsAndReports.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'MetricsBarChart',
  components: { AppIcon },
  props: {
    data: { type: Array as PropType<RequestsByType[]>, required: true },
  },
  setup(props) {
    const { t } = useI18n();

    const maxValue = computed(() => {
      const max = Math.max(...props.data.map((d) => d.count));
      return Math.ceil(max / 60) * 60;
    });

    const yTicks = computed(() => {
      const max = maxValue.value;
      const step = max / 4;
      return [max, max - step, max - step * 2, max - step * 3, 0];
    });

    const getBarHeight = (count: number) => {
      const percentage = (count / maxValue.value) * 100;
      return `${percentage}%`;
    };

    return { t, yTicks, getBarHeight };
  },
});
</script>

<style scoped>
.metrics-bar-chart {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-bar-chart__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.metrics-bar-chart__title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metrics-bar-chart__title-icon {
  font-size: 18px;
  color: #637381;
}

.metrics-bar-chart__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.metrics-bar-chart__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 2px 0 0;
}

.metrics-bar-chart__body {
  flex: 1;
}

.metrics-bar-chart__chart {
  display: flex;
  gap: 12px;
  height: 260px;
}

.metrics-bar-chart__y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 30px;
}

.metrics-bar-chart__y-tick {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
  text-align: right;
  min-width: 30px;
}

.metrics-bar-chart__bars-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  border-left: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 16px;
  padding-bottom: 30px;
  position: relative;
}

.metrics-bar-chart__bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.metrics-bar-chart__bar-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  width: 100%;
  justify-content: center;
}

.metrics-bar-chart__bar {
  width: 48px;
  max-width: 100%;
  border-radius: 6px 6px 0 0;
  transition: height 0.5s ease;
  position: relative;
  min-height: 8px;
}

.metrics-bar-chart__bar-value {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #212b36;
  white-space: nowrap;
  display: none;
}

.metrics-bar-chart__bar:hover .metrics-bar-chart__bar-value {
  display: block;
}

.metrics-bar-chart__bar-label {
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  color: #637381;
  text-align: center;
  margin-top: 8px;
  position: absolute;
  bottom: -30px;
  white-space: nowrap;
  transform: rotate(-15deg);
  transform-origin: top center;
}
</style>
