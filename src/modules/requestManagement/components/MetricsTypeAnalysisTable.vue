<template>
  <div class="metrics-type-analysis">
    <div class="metrics-type-analysis__header">
      <div class="metrics-type-analysis__title-wrapper">
        <AppIcon icon="clipboard-list" class="metrics-type-analysis__title-icon" />
        <div>
          <h3 class="metrics-type-analysis__title">
            {{ t('Análisis Detallado por Tipo de Solicitud') }}
          </h3>
          <p class="metrics-type-analysis__subtitle">
            {{ t('Indicadores clave de rendimiento por categoría') }}
          </p>
        </div>
      </div>
    </div>
    <div class="metrics-type-analysis__body">
      <table class="metrics-type-analysis__table">
        <thead>
          <tr>
            <th class="metrics-type-analysis__th">
              {{ t('Tipo de Solicitud') }}
            </th>
            <th class="metrics-type-analysis__th">
              {{ t('Total Solicitudes') }}
            </th>
            <th class="metrics-type-analysis__th">
              {{ t('Tiempo Promedio de Respuesta') }}
            </th>
            <th class="metrics-type-analysis__th">
              {{ t('Tasa de Aprobación') }}
            </th>
            <th class="metrics-type-analysis__th">{{ t('Tendencia') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.type" class="metrics-type-analysis__row">
            <td class="metrics-type-analysis__td">
              <span class="metrics-type-analysis__type-name">{{ item.type }}</span>
            </td>
            <td class="metrics-type-analysis__td">
              <div class="metrics-type-analysis__requests">
                <span class="metrics-type-analysis__requests-value">{{ item.totalRequests }}</span>
                <span class="metrics-type-analysis__requests-percent">{{ item.percentage }}%</span>
              </div>
            </td>
            <td class="metrics-type-analysis__td">
              <div class="metrics-type-analysis__time">
                <AppIcon icon="clock" class="metrics-type-analysis__time-icon" />
                <span>{{ item.avgResponseTime }}</span>
              </div>
            </td>
            <td class="metrics-type-analysis__td">
              <div class="metrics-type-analysis__rate">
                <div class="metrics-type-analysis__rate-bar">
                  <div
                    class="metrics-type-analysis__rate-fill"
                    :style="{
                      width: item.approvalRate + '%',
                      backgroundColor: getRateColor(item.approvalRate),
                    }"
                  ></div>
                </div>
                <span class="metrics-type-analysis__rate-value">{{ item.approvalRate }}%</span>
              </div>
            </td>
            <td class="metrics-type-analysis__td">
              <div class="metrics-type-analysis__trend" :class="'metrics-type-analysis__trend--' + item.trend">
                <AppIcon :icon="item.trend === 'up' ? 'arrow-up' : 'arrow-down'" class="metrics-type-analysis__trend-icon" />
                <span>{{ item.trend === 'up' ? t('Positiva') : t('Negativa') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RequestTypeAnalysis } from '../dtos/metricsAndReports.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'MetricsTypeAnalysisTable',
  components: { AppIcon },
  props: {
    data: { type: Array as PropType<RequestTypeAnalysis[]>, required: true },
  },
  setup() {
    const { t } = useI18n();

    const getRateColor = (rate: number): string => {
      if (rate >= 90) return '#10B981';
      if (rate >= 80) return '#3B82F6';
      return '#F59E0B';
    };

    return { t, getRateColor };
  },
});
</script>

<style scoped>
.metrics-type-analysis {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-type-analysis__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.metrics-type-analysis__title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metrics-type-analysis__title-icon {
  font-size: 18px;
  color: #637381;
}

.metrics-type-analysis__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.metrics-type-analysis__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 2px 0 0;
}

.metrics-type-analysis__table {
  width: 100%;
  border-collapse: collapse;
}

.metrics-type-analysis__th {
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #919eab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.metrics-type-analysis__row {
  border-bottom: 1px solid #f4f6f8;
  transition: background-color 0.15s ease;
}

.metrics-type-analysis__row:hover {
  background-color: #f9fafb;
}

.metrics-type-analysis__row:last-child {
  border-bottom: none;
}

.metrics-type-analysis__td {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
  padding: 16px;
  vertical-align: middle;
}

.metrics-type-analysis__type-name {
  font-weight: 500;
}

.metrics-type-analysis__requests {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metrics-type-analysis__requests-value {
  font-size: 18px;
  font-weight: 700;
  color: #212b36;
}

.metrics-type-analysis__requests-percent {
  font-size: 13px;
  color: #919eab;
}

.metrics-type-analysis__time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #637381;
}

.metrics-type-analysis__time-icon {
  font-size: 14px;
  color: #919eab;
}

.metrics-type-analysis__rate {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metrics-type-analysis__rate-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  max-width: 120px;
}

.metrics-type-analysis__rate-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.metrics-type-analysis__rate-value {
  font-size: 13px;
  font-weight: 600;
  color: #212b36;
  min-width: 36px;
}

.metrics-type-analysis__trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.metrics-type-analysis__trend--up {
  color: #10b981;
}

.metrics-type-analysis__trend--down {
  color: #ef4444;
}

.metrics-type-analysis__trend-icon {
  font-size: 12px;
}
</style>
