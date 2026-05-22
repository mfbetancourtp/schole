<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton style="color: white" :disabled="isLoading || isExporting" @click="handleExportReport"> <AppIcon icon="download" style="margin-right: 0.25rem" /> Exportar reporte </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <div class="page-header">
          <h1 class="page-title">Reportes y analítica</h1>
          <p class="page-subtitle">Administra y configura los recursos físicos académicos de tu institución</p>
        </div>

        <div class="analytics-body">
          <!-- KPIs: Espacios -->
          <div class="section-header">
            <AppIcon icon="building" class="icon-blue" />
            <span>Espacios</span>
          </div>
          <div class="kpi-grid kpi-grid--3">
            <AnalyticsKpiCard label="Total de espacios" :value="stats.totalSpaces" icon="building" icon-variant="blue" />
            <AnalyticsKpiCard label="Espacios activos" :value="stats.activeSpaces" icon="check-circle" icon-variant="green" />
            <AnalyticsKpiCard label="Capacidad total instalada" :value="stats.totalCapacity.toLocaleString('es-CO')" icon="users" icon-variant="purple" />
          </div>

          <!-- KPIs: Recursos -->
          <div class="section-header">
            <AppIcon icon="box" class="icon-purple" />
            <span>Recursos</span>
          </div>
          <div class="kpi-grid kpi-grid--4">
            <AnalyticsKpiCard label="Total de recursos" :value="stats.totalResources" icon="box" icon-variant="blue" />
            <AnalyticsKpiCard label="Recursos disponibles" :value="stats.availableResources" icon="check-circle" icon-variant="green" />
            <AnalyticsKpiCard label="Recursos asignados" :value="stats.assignedResources" icon="map-marker-alt" icon-variant="blue-light" />
            <AnalyticsKpiCard label="En mantenimiento" :value="stats.maintenanceResources" icon="tools" icon-variant="orange" />
          </div>

          <!-- Charts row 1 -->
          <div class="charts-row">
            <AnalyticsChartCard title="Espacios por tipo" subtitle="Distribución de espacios según su clasificación">
              <VueApexCharts type="bar" height="260" :options="spacesByTypeOptions" :series="spacesByTypeSeries" />
            </AnalyticsChartCard>
            <AnalyticsChartCard title="Distribución de recursos por estado" subtitle="Estado actual del inventario de recursos">
              <VueApexCharts type="pie" height="260" :options="resourcesByStatusOptions" :series="resourcesByStatusSeries" />
            </AnalyticsChartCard>
          </div>

          <!-- Charts row 2 -->
          <div class="charts-row">
            <AnalyticsChartCard title="Recursos por tipo" subtitle="Distribución del inventario por categoría">
              <VueApexCharts type="bar" height="260" :options="resourcesByTypeOptions" :series="resourcesByTypeSeries" />
            </AnalyticsChartCard>
          </div>

          <!-- Tabs -->
          <div class="detail-card">
            <div class="tab-nav" role="tablist">
              <button class="tab-btn" :class="{ active: activeTab === 'spaces' }" type="button" role="tab" @click="activeTab = 'spaces'">
                <AppIcon icon="building" />
                Espacios
                <span class="tab-count">{{ stats.totalSpaces }}</span>
              </button>
              <button class="tab-btn" :class="{ active: activeTab === 'resources' }" type="button" role="tab" @click="activeTab = 'resources'">
                <AppIcon icon="box" />
                Recursos
                <span class="tab-count">{{ stats.totalResources }}</span>
              </button>
            </div>

            <div class="tab-body">
              <div v-show="activeTab === 'spaces'" role="tabpanel">
                <AnalyticsSpacesTable v-model:isActive="spacesIsActive" />
              </div>
              <div v-show="activeTab === 'resources'" role="tabpanel">
                <AnalyticsResourcesTable v-model:stateId="resourcesStateId" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import VueApexCharts from 'vue3-apexcharts';

import { useHeaderStore } from '../../../stores/header.store';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import AnalyticsKpiCard from '../components/AnalyticsKpiCard.vue';
import AnalyticsChartCard from '../components/AnalyticsChartCard.vue';
import AnalyticsSpacesTable from '../components/AnalyticsSpacesTable.vue';
import AnalyticsResourcesTable from '../components/AnalyticsResourcesTable.vue';

import { GetSpaceStatsService } from '../services/getSpaceStats.service';
import { GetResourceStatsService } from '../services/getResourceStats.service';
import { GetSpacesService } from '../services/getSpaces.service';
import { GetResourceInventoryService } from '../services/getResourceInventory.service';

// ── Chart options ──────────────────────────────────────────────────────────

const CHART_TOOLBAR = { show: false };

// ── Component ──────────────────────────────────────────────────────────────

export default defineComponent({
  name: 'PhysicalResourcesAnalytics',

  components: {
    AppBaseList,
    AppButton,
    AppIcon,
    AppLoading,
    VueApexCharts,
    AnalyticsKpiCard,
    AnalyticsChartCard,
    AnalyticsSpacesTable,
    AnalyticsResourcesTable,
  },

  setup() {
    const title = 'Reportes y analítica';
    useMeta({ title });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Recursos físicos académicos', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const isLoading = ref(true);
    const isExporting = ref(false);
    const activeTab = ref<'spaces' | 'resources'>('spaces');

    const spacesIsActive = ref('');
    const resourcesStateId = ref('');

    const spacesByTypeOptions = ref({
      chart: { type: 'bar', toolbar: CHART_TOOLBAR },
      plotOptions: {
        bar: { borderRadius: 4, columnWidth: '55%', distributed: true },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316'],
      xaxis: {
        categories: [] as string[],
        labels: { style: { fontSize: '11px' } },
      },
      yaxis: { labels: { style: { fontSize: '11px' } } },
      grid: { borderColor: '#f1f5f9' },
    });
    const spacesByTypeSeries = ref([{ name: 'Espacios', data: [] as number[] }]);

    const resourceStates = ref<{ name: string; count: number; percentage: number }[]>([]);

    const resourcesByStatusOptions = ref({
      chart: { type: 'pie', toolbar: CHART_TOOLBAR },
      labels: [] as string[],
      colors: ['#10b981', '#2563eb', '#ef4444', '#f59e0b'],
      legend: { position: 'bottom', fontSize: '12px', fontFamily: 'inherit' },
      dataLabels: {
        formatter: (_val: number, opts: any) => {
          const pct = resourceStates.value[opts.seriesIndex]?.percentage ?? 0;
          return `${pct}%`;
        },
        style: { fontSize: '12px' },
      },
      tooltip: {
        y: {
          formatter: (_val: number, opts: any) => {
            const count = resourceStates.value[opts.seriesIndex]?.count ?? 0;
            return `${count} recursos`;
          },
        },
      },
    });
    const resourcesByStatusSeries = ref<number[]>([]);

    const resourcesByTypeOptions = ref({
      chart: { type: 'bar', toolbar: CHART_TOOLBAR },
      plotOptions: {
        bar: { borderRadius: 4, columnWidth: '55%', distributed: true },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
      xaxis: {
        categories: [] as string[],
        labels: { style: { fontSize: '11px' }, rotate: -30 },
      },
      yaxis: { labels: { style: { fontSize: '11px' } } },
      grid: { borderColor: '#f1f5f9' },
    });
    const resourcesByTypeSeries = ref([{ name: 'Recursos', data: [] as number[] }]);

    const stats = ref({
      totalSpaces: 0,
      activeSpaces: 0,
      totalCapacity: 0,
      totalResources: 0,
      availableResources: 0,
      assignedResources: 0,
      maintenanceResources: 0,
    });

    onMounted(async () => {
      try {
        const [spaceData, resourceData] = await Promise.all([new GetSpaceStatsService().run(), new GetResourceStatsService().run()]);

        stats.value.totalSpaces = spaceData.totalSpaces;
        stats.value.activeSpaces = spaceData.activeSpaces;
        stats.value.totalCapacity = spaceData.totalCapacity;

        spacesByTypeOptions.value = {
          ...spacesByTypeOptions.value,
          xaxis: {
            ...spacesByTypeOptions.value.xaxis,
            categories: spaceData.byType.map((t: any) => t.name),
          },
        };
        spacesByTypeSeries.value = [{ name: 'Espacios', data: spaceData.byType.map((t: any) => t.count) }];

        const byState = (name: string) => resourceData.byState.find((s: any) => s.name === name)?.count ?? 0;

        stats.value.totalResources = resourceData.totalResources;
        stats.value.availableResources = byState('Disponible');
        stats.value.assignedResources = byState('Asignado');
        stats.value.maintenanceResources = byState('En mantenimiento');

        resourceStates.value = resourceData.byState;
        const minSlice = Math.max(1, Math.round(resourceData.totalResources * 0.03));
        resourcesByStatusOptions.value = {
          ...resourcesByStatusOptions.value,
          labels: resourceData.byState.map((s: any) => s.name),
        };
        resourcesByStatusSeries.value = resourceData.byState.map((s: any) => (s.count === 0 ? minSlice : s.count));

        resourcesByTypeOptions.value = {
          ...resourcesByTypeOptions.value,
          xaxis: {
            ...resourcesByTypeOptions.value.xaxis,
            categories: resourceData.byType.map((t: any) => t.name),
          },
        };
        resourcesByTypeSeries.value = [
          {
            name: 'Recursos',
            data: resourceData.byType.map((t: any) => t.count),
          },
        ];
      } finally {
        isLoading.value = false;
      }
    });

    const downloadCsv = (rows: (string | number)[][], filename: string) => {
      const csv = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleExportReport = async () => {
      if (isExporting.value) return;
      isExporting.value = true;
      try {
        if (activeTab.value === 'spaces') {
          const params: Record<string, any> = { noPag: 'true' };
          if (spacesIsActive.value !== '') params.isActive = Number(spacesIsActive.value);
          const result = await new GetSpacesService().run(params);
          const rows = (result.data ?? []).map((s: any) => [s.code, s.name, s.spaceTypeName, s.hierarchicalPath, s.capacity, s.isActive ? 'Activo' : 'Inactivo']);
          downloadCsv([['codigo', 'nombre', 'tipo', 'ubicacion', 'capacidad', 'estado'], ...rows], 'reporte_espacios.csv');
        } else {
          const params: Record<string, any> = { noPag: 'true' };
          if (resourcesStateId.value !== '') params.initialStateId = Number(resourcesStateId.value);
          const result = await new GetResourceInventoryService().run(params);
          const items: any[] = Array.isArray(result) ? result : result.data ?? [];
          const rows = items.map((r: any) => [
            r.code,
            r.resourceType?.name ?? '',
            r.serial ?? '',
            r.initialState?.name ?? '',
            r.space?.name ?? '',
            r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString('es-CO') : '',
          ]);
          downloadCsv([['codigo', 'tipo', 'serial', 'estado', 'espacio_asignado', 'fecha_compra'], ...rows], 'reporte_recursos.csv');
        }
      } finally {
        isExporting.value = false;
      }
    };

    return {
      title,
      isLoading,
      isExporting,
      activeTab,
      spacesIsActive,
      resourcesStateId,
      stats,
      spacesByTypeOptions,
      spacesByTypeSeries,
      resourcesByStatusOptions,
      resourcesByStatusSeries,
      resourcesByTypeOptions,
      resourcesByTypeSeries,
      handleExportReport,
    };
  },
});
</script>

<style scoped>
.page-header {
  padding: 1rem 1.5rem 0.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.analytics-body {
  margin: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: -0.5rem;
}

.icon-blue {
  color: #3b82f6;
}

.icon-purple {
  color: #8b5cf6;
}

.kpi-grid {
  display: grid;
  gap: 0.75rem;
}

.kpi-grid--3 {
  grid-template-columns: repeat(3, 1fr);
}

.kpi-grid--4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 767px) {
  .kpi-grid--3 {
    grid-template-columns: 1fr;
  }
  .kpi-grid--4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 991px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

.detail-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #fff;
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.875rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.tab-btn:hover {
  color: #3b82f6;
  border-bottom-color: #bfdbfe;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.tab-body {
  padding: 1rem;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  background-color: #e0e7ff;
  color: #3730a3;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.tab-btn.active .tab-count {
  background-color: #3b82f6;
  color: #fff;
}
</style>
