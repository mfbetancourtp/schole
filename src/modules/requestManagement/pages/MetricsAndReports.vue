<template>
  <AppBaseList :title="t('Métricas y Reportes')">
    <template #actions>
      <AppButton :label="t('Exportar Reporte')" variant="primary" icon="download" @click="exportReport" />
    </template>
    <template #content>
      <AppPulseLoading v-if="loading" />

      <div v-else class="metrics-reports">
        <!-- Header -->
        <div class="metrics-reports__header">
          <div>
            <h2 class="metrics-reports__title">
              {{ t('Métricas y Reportes') }}
            </h2>
            <p class="metrics-reports__subtitle">
              {{ t('Dashboard analítico de indicadores de gestión de solicitudes') }}
            </p>
          </div>
        </div>

        <!-- Filters -->
        <div class="metrics-reports__filters">
          <div class="metrics-reports__filter-group">
            <AppSelect v-model="selectedPeriod" class="metrics-reports__period-select">
              <option v-for="period in periodOptions" :key="period.value" :value="period.value">
                {{ period.label }}
              </option>
            </AppSelect>
            <AppButton :label="t('Filtros Avanzados')" variant="secondary" icon="filter" outlined @click="toggleFilters" />
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="metrics-reports__summary">
          <MetricsSummaryCard
            v-for="card in data.summaryCards"
            :key="card.label"
            :label="card.label"
            :value="card.value"
            :description="card.description"
            :trendPercent="card.trendPercent"
            :trendDirection="card.trendDirection"
            :icon="card.icon"
            :iconBgColor="card.iconBgColor"
            :iconColor="card.iconColor"
          />
        </div>

        <!-- Charts Row: Bar + Pie -->
        <div class="metrics-reports__charts-row">
          <MetricsBarChart :data="data.requestsByType" />
          <MetricsPieChart :data="data.requestsByStatus" />
        </div>

        <!-- Line Chart: Monthly Trends -->
        <MetricsLineChart :data="data.monthlyTrends" />

        <!-- Type Analysis Table -->
        <MetricsTypeAnalysisTable :data="data.typeAnalysis" />

        <!-- Highlights -->
        <div class="metrics-reports__highlights">
          <MetricsHighlightCard
            v-for="highlight in data.highlights"
            :key="highlight.title"
            :icon="highlight.icon"
            :iconBgColor="highlight.iconBgColor"
            :iconColor="highlight.iconColor"
            :title="highlight.title"
            :value="highlight.value"
            :description="highlight.description"
          />
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

// Shared components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';

// Module components
import MetricsSummaryCard from '../components/MetricsSummaryCard.vue';
import MetricsBarChart from '../components/MetricsBarChart.vue';
import MetricsPieChart from '../components/MetricsPieChart.vue';
import MetricsLineChart from '../components/MetricsLineChart.vue';
import MetricsTypeAnalysisTable from '../components/MetricsTypeAnalysisTable.vue';
import MetricsHighlightCard from '../components/MetricsHighlightCard.vue';

// Services & types
import { metricsAndReportsService } from '../services/metricsAndReports.service';
import type { MetricsAndReportsData } from '../dtos/metricsAndReports.dto';

export default defineComponent({
  name: 'MetricsAndReports',
  components: {
    AppBaseList,
    AppButton,
    AppPulseLoading,
    AppSelect,
    MetricsSummaryCard,
    MetricsBarChart,
    MetricsPieChart,
    MetricsLineChart,
    MetricsTypeAnalysisTable,
    MetricsHighlightCard,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Métricas y Reportes' });

    const loading = ref(true);
    const selectedPeriod = ref('last_month');

    const periodOptions = [
      { value: 'last_week', label: t('Última semana') },
      { value: 'last_month', label: t('Último mes') },
      { value: 'last_quarter', label: t('Último trimestre') },
      { value: 'last_semester', label: t('Último semestre') },
      { value: 'last_year', label: t('Último año') },
    ];

    const data = ref<MetricsAndReportsData>({
      summaryCards: [],
      requestsByType: [],
      requestsByStatus: [],
      monthlyTrends: [],
      typeAnalysis: [],
      highlights: [],
    });

    const loadData = async () => {
      loading.value = true;
      try {
        data.value = await metricsAndReportsService.getData();
      } finally {
        loading.value = false;
      }
    };

    const exportReport = () => {
      // Future: implement report export
    };

    const toggleFilters = () => {
      // Future: implement advanced filters drawer
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Gestión de Solicitudes', url: '' };
      headerStorage.moduleItem = { name: 'Métricas y Reportes', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadData();
    });

    return {
      t,
      loading,
      selectedPeriod,
      periodOptions,
      data,
      exportReport,
      toggleFilters,
    };
  },
});
</script>

<style scoped>
.metrics-reports {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

/* Header */
.metrics-reports__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metrics-reports__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.metrics-reports__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

/* Filters */
.metrics-reports__filters {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.metrics-reports__filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metrics-reports__period-select {
  min-width: 180px;
}

/* Summary Cards */
.metrics-reports__summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .metrics-reports__summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .metrics-reports__summary {
    grid-template-columns: 1fr;
  }
}

/* Charts Row */
.metrics-reports__charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .metrics-reports__charts-row {
    grid-template-columns: 1fr;
  }
}

/* Highlights */
.metrics-reports__highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .metrics-reports__highlights {
    grid-template-columns: 1fr;
  }
}
</style>
