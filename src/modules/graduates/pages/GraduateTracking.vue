<template>
  <AppBaseList title="Seguimiento de Egresados">
    <template #actions>
      <AppButton variant="light" outlined size="sm" nativeType="button" :disabled="exporting" @click="exportExcel">
        <span v-if="exporting" class="spinner-border spinner-border-sm me-1" role="status"></span>
        <AppIcon v-else icon="download" />
        {{ exporting ? 'Exportando...' : 'Exportar Excel' }}
      </AppButton>
    </template>

    <template #content>
      <div class="gt-page">
        <p class="gt-subtitle">Indicadores de empleabilidad y situación laboral de los egresados</p>

        <!-- ── KPI Cards ─────────────────────────────────────────────────── -->
        <div class="gt-kpis">
          <div class="gt-kpi-card">
            <div class="gt-kpi-top">
              <div class="gt-kpi-icon gt-kpi-icon--blue">
                <AppIcon icon="users" />
              </div>
              <!-- <span class="gt-kpi-badge gt-kpi-badge--green">{{ totalGraduatesBadge }}</span> -->
            </div>
            <p class="gt-kpi-label">Total Egresados</p>
            <p class="gt-kpi-value">{{ formatNumber(totalGraduates) }}</p>
          </div>

          <div class="gt-kpi-card">
            <div class="gt-kpi-top">
              <div class="gt-kpi-icon gt-kpi-icon--green">
                <AppIcon icon="briefcase" />
              </div>
              <!-- <span class="gt-kpi-badge gt-kpi-badge--green">{{ employedBadge }}</span> -->
            </div>
            <p class="gt-kpi-label">Empleados</p>
            <p class="gt-kpi-value">{{ formatNumber(totalEmployed) }}</p>
          </div>

          <div class="gt-kpi-card">
            <div class="gt-kpi-top">
              <div class="gt-kpi-icon gt-kpi-icon--red">
                <AppIcon icon="user-minus" />
              </div>
              <!-- <span class="gt-kpi-badge gt-kpi-badge--red">{{ unemployedBadge }}</span> -->
            </div>
            <p class="gt-kpi-label">Desempleados</p>
            <p class="gt-kpi-value">{{ formatNumber(totalUnemployed) }}</p>
          </div>

          <div class="gt-kpi-card">
            <div class="gt-kpi-top">
              <div class="gt-kpi-icon gt-kpi-icon--purple">
                <AppIcon icon="chart-line" />
              </div>
              <!-- <span class="gt-kpi-badge gt-kpi-badge--green">{{ employabilityRateBadge }}</span> -->
            </div>
            <p class="gt-kpi-label">Tasa de Empleabilidad</p>
            <p class="gt-kpi-value">{{ formatPercentage(employabilityRate) }}%</p>
          </div>

          <div class="gt-kpi-card">
            <div class="gt-kpi-top">
              <div class="gt-kpi-icon gt-kpi-icon--yellow">
                <AppIcon icon="dollar-sign" />
              </div>
              <!-- <span class="gt-kpi-badge gt-kpi-badge--green">{{ averageSalaryBadge }}</span> -->
            </div>
            <p class="gt-kpi-label">Salario Promedio</p>
            <p class="gt-kpi-value">{{ formatCurrency(averageSalary) }}</p>
          </div>

          <div class="gt-kpi-card">
            <div class="gt-kpi-top">
              <div class="gt-kpi-icon gt-kpi-icon--teal">
                <AppIcon icon="clock" />
              </div>
              <!-- <span class="gt-kpi-badge gt-kpi-badge--red">{{ avgEmploymentMonthsBadge }}</span> -->
            </div>
            <p class="gt-kpi-label">Tiempo Promedio Empleo</p>
            <p class="gt-kpi-value">{{ formatDecimal(avgEmploymentMonths) }} meses</p>
          </div>
        </div>

        <!-- ── Charts ────────────────────────────────────────────────────── -->
        <div class="gt-charts">
          <!-- Egresados por Sector -->
          <div class="gt-chart-card">
            <p class="gt-chart-title">Egresados por Sector</p>
            <div class="gt-sector-list">
              <div v-for="sector in sectorData" :key="sector.name" class="gt-sector-row">
                <div class="gt-sector-meta">
                  <span class="gt-sector-name">{{ sector.name }}</span>
                  <span class="gt-sector-count">{{ sector.count.toLocaleString('es-CO') }} ({{ sector.pct }}%)</span>
                </div>
                <div class="gt-sector-bar-bg">
                  <div
                    class="gt-sector-bar-fill"
                    :style="{
                      width: sector.pct + '%',
                      background: sector.color,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado Laboral (donut) -->
          <div class="gt-chart-card">
            <p class="gt-chart-title">Estado Laboral</p>
            <VueApexCharts type="donut" height="220" :options="donutOptions" :series="donutSeries" />
            <div class="gt-donut-legend">
              <span class="gt-donut-dot gt-donut-dot--green"></span>
              <span class="gt-donut-lbl">{{ estadoLaboralLegend[0]?.label || 'Empleados' }}</span>
              <span class="gt-donut-pct">{{ formatPercentage(estadoLaboralLegend[0]?.percentage || 0) }}%</span>
              <span class="gt-donut-dot gt-donut-dot--red" style="margin-left: 16px"></span>
              <span class="gt-donut-lbl">{{ estadoLaboralLegend[1]?.label || 'Desempleados' }}</span>
              <span class="gt-donut-pct">{{ formatPercentage(estadoLaboralLegend[1]?.percentage || 0) }}%</span>
            </div>
          </div>

          <!-- Evolución de Empleabilidad -->
          <div class="gt-chart-card">
            <p class="gt-chart-title">Evolución de Empleabilidad</p>
            <div class="gt-evolution-list">
              <div v-for="item in evolutionData" :key="item.year" class="gt-evo-row">
                <span class="gt-evo-year">{{ item.year }}</span>
                <div class="gt-evo-bar-bg">
                  <div class="gt-evo-bar-fill" :style="{ width: item.percentage + '%' }"></div>
                </div>
                <span class="gt-evo-pct">{{ item.percentage }}%</span>
              </div>
            </div>
            <p class="gt-evo-trend"><AppIcon icon="chart-line" /> Tendencia ascendente en los últimos años</p>
          </div>
        </div>

        <!-- ── Graduate listing ──────────────────────────────────────────── -->
        <div class="gt-section">
          <p class="gt-section-title">Listado de Egresados</p>

          <AppDatatable name="graduate-tracking" :service="graduatesService" :params="tableParams">
            <template #filters>
              <div class="gt-filter-group">
                <label class="gt-filter-label">Estado Laboral</label>
                <select class="form-select form-select-sm" v-model="employmentStatus">
                  <option value="">Todos los estados</option>
                  <option value="Empleado">Empleado</option>
                  <option value="No Empleado">No Empleado</option>
                </select>
              </div>
            </template>

            <!-- Egresado -->
            <AppDatatableColumn label="Egresado" field="names" :sortable="true" v-slot="{ row }">
              <div class="gt-grad-cell">
                <img v-if="row.avatar" :src="row.avatar" :alt="`${row.names} ${row.lastnames}`" class="gt-grad-avatar" />
                <span v-else class="gt-grad-initials">{{ row.names?.[0] ?? '' }}{{ row.lastnames?.[0] ?? '' }}</span>
                <p class="gt-grad-name">{{ row.names }} {{ row.lastnames }}</p>
              </div>
            </AppDatatableColumn>

            <!-- Empresa Actual -->
            <AppDatatableColumn label="Empresa Actual" field="company" v-slot="{ row }">
              <p class="gt-company-name">{{ row.company || '-' }}</p>
              <p class="gt-company-role">{{ row.area || '-' }}</p>
            </AppDatatableColumn>

            <!-- Estado -->
            <AppDatatableColumn label="Estado" field="employmentStatus" :sortable="true" v-slot="{ row }">
              <span class="gt-status-badge" :class="row.employmentStatus === 'Empleado' ? 'gt-badge--employed' : 'gt-badge--unemployed'">
                {{ row.employmentStatus }}
              </span>
            </AppDatatableColumn>

            <!-- Última Actualización -->
            <AppDatatableColumn label="Última Actualización" field="lastUpdated" v-slot="{ row }">
              <span class="gt-td-updated">{{ formatRelativeDate(row.lastUpdated) }}</span>
            </AppDatatableColumn>

            <!-- Acciones -->
            <AppDatatableColumn label="Acciones" position="right" v-slot="{ row }">
              <AppButtonGroup>
                <AppButton variant="primary" outlined v-tooltip="'Ver perfil'" @click="viewGradProfile(row)">
                  <AppIcon icon="eye" />
                </AppButton>
              </AppButtonGroup>
            </AppDatatableColumn>
          </AppDatatable>
        </div>
      </div>

      <GraduateProfileDrawer v-model:isVisible="showProfileDrawer" :graduate="selectedGraduate" />
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import VueApexCharts from 'vue3-apexcharts';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import GraduateProfileDrawer from '../components/GraduateProfileDrawer.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { ToastService } from '../../../shared/services/toast.service';
import { GetGraduatesDashboardService } from '../services/getGraduatesDashboard.service';
import { GetGraduateTrackingStatsService } from '../services/getGraduateTrackingStats.service';
import type { GraduateTrackingStatsDto } from '../dtos/graduateTrackingStats.dto';

const graduateTrackingStatsService = new GetGraduateTrackingStatsService();
const toast = new ToastService();

export default defineComponent({
  name: 'GraduateTrackingPage',
  components: {
    AppBaseList,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppButtonGroup,
    AppButton,
    GraduateProfileDrawer,
    VueApexCharts,
  },
  setup() {
    useMeta({ title: 'Seguimiento de Egresados' });
    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Egresados', url: '' };
    headerStore.moduleItem = { name: 'Seguimiento', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const graduatesService = new GetGraduatesDashboardService();
    const stats = ref<GraduateTrackingStatsDto | null>(null);

    const employmentStatus = ref('');
    const tableParams = computed(() => ({
      employmentStatus: employmentStatus.value || undefined,
    }));

    onMounted(async () => {
      try {
        stats.value = await graduateTrackingStatsService.run();
      } catch (e) {
        console.error(e);
      }
    });

    const totalGraduates = computed(() => stats.value?.totalGraduates ?? 0);
    const totalEmployed = computed(() => stats.value?.totalEmployed ?? 0);
    const totalUnemployed = computed(() => stats.value?.totalUnemployed ?? 0);
    const employabilityRate = computed(() => stats.value?.employabilityRate ?? 0);
    const averageSalary = computed(() => stats.value?.averageSalary ?? 0);
    const avgEmploymentMonths = computed(() => stats.value?.avgEmploymentMonths ?? 0);
    const estadoLaboralLegend = computed(() => stats.value?.estadoLaboral ?? []);
    const evolutionData = computed(() => stats.value?.employabilityEvolution ?? []);

    const donutOptions = computed(() => ({
      chart: { type: 'donut', toolbar: { show: false } },
      colors: ['#22c55e', '#ef4444'],
      labels: estadoLaboralLegend.value.map((item) => item.label),
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: { pie: { donut: { size: '65%' } } },
      tooltip: { y: { formatter: (v: number) => v + '%' } },
    }));
    const donutSeries = computed(() => estadoLaboralLegend.value.map((item) => item.percentage));

    const graduatesArea = computed(() => stats.value?.graduatesArea ?? []);

    const SECTOR_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#ef4444'];

    const sectorData = computed(() =>
      graduatesArea.value.map((item, i) => ({
        name: item.area,
        count: item.totalApplications,
        pct: item.percentage,
        color: SECTOR_COLORS[i % SECTOR_COLORS.length],
      }))
    );

    const formatNumber = (value: number) => new Intl.NumberFormat('es-CO').format(value);
    const formatPercentage = (value: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value);
    const formatDecimal = (value: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value);
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(value);

    const formatRelativeDate = (value: string | null) => {
      if (!value) return '-';
      const diff = Date.now() - new Date(value).getTime();
      const days = Math.floor(diff / 86400000);
      if (days === 0) return 'Hoy';
      if (days === 1) return 'Ayer';
      if (days < 7) return `Hace ${days} días`;
      if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`;
      if (days < 365) return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`;
      return `Hace ${Math.floor(days / 365)} año${Math.floor(days / 365) > 1 ? 's' : ''}`;
    };

    const showProfileDrawer = ref(false);
    const selectedGraduate = ref<any>(null);
    const viewGradProfile = (grad: any) => {
      selectedGraduate.value = grad;
      showProfileDrawer.value = true;
    };

    const exporting = ref(false);
    const exportExcel = async () => {
      if (exporting.value) return;
      exporting.value = true;
      try {
        const res = await graduatesService.run({
          noPag: 'true',
          employmentStatus: employmentStatus.value || undefined,
        });
        const rows: any[] = res?.data ?? [];
        const headers = ['Nombre', 'Empresa', 'Área', 'Estado Laboral'];
        const csvRows = rows.map((g: any) => [((g.names ?? '') + ' ' + (g.lastnames ?? '')).trim(), g.company ?? '', g.area ?? '', g.employmentStatus ?? '']);
        const csv = [headers, ...csvRows].map((row) => row.map((cell: any) => JSON.stringify(String(cell))).join(',')).join('\r\n');
        const blob = new Blob(['' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'seguimiento_egresados_' + new Date().toISOString().slice(0, 10) + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.show('Archivo exportado exitosamente.', 'success');
      } catch {
        // interceptor muestra el error del backend
      } finally {
        exporting.value = false;
      }
    };

    return {
      graduatesService,
      employmentStatus,
      tableParams,
      showProfileDrawer,
      selectedGraduate,
      viewGradProfile,
      exporting,
      exportExcel,
      totalGraduates,
      totalEmployed,
      totalUnemployed,
      employabilityRate,
      averageSalary,
      avgEmploymentMonths,
      estadoLaboralLegend,
      donutOptions,
      donutSeries,
      sectorData,
      evolutionData,
      formatNumber,
      formatPercentage,
      formatDecimal,
      formatCurrency,
      formatRelativeDate,
    };
  },
});
</script>

<style scoped>
.gt-page {
  padding: 4px 0 32px;
}

.gt-subtitle {
  font-size: 0.85rem;
  color: #6c757d;
  margin: -4px 0 20px;
}

/* ── KPI Cards ──────────────────────────────────────────────────────────── */
.gt-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.gt-kpi-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px 18px;
}

.gt-kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.gt-kpi-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.gt-kpi-icon--blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.gt-kpi-icon--green {
  background: #dcfce7;
  color: #16a34a;
}
.gt-kpi-icon--red {
  background: #fee2e2;
  color: #dc2626;
}
.gt-kpi-icon--purple {
  background: #ede9fe;
  color: #6d28d9;
}
.gt-kpi-icon--yellow {
  background: #fef9c3;
  color: #b45309;
}
.gt-kpi-icon--teal {
  background: #ccfbf1;
  color: #0f766e;
}

.gt-kpi-badge {
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 20px;
  padding: 2px 9px;
}

.gt-kpi-badge--green {
  background: #dcfce7;
  color: #15803d;
}
.gt-kpi-badge--red {
  background: #fee2e2;
  color: #b91c1c;
}

.gt-kpi-label {
  font-size: 0.78rem;
  color: #6c757d;
  margin: 0 0 4px;
}

.gt-kpi-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1;
}

/* ── Charts ─────────────────────────────────────────────────────────────── */
.gt-charts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.gt-chart-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
}

.gt-chart-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px;
}

/* Sector bars */
.gt-sector-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gt-sector-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gt-sector-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.gt-sector-name {
  font-size: 0.82rem;
  color: #374151;
  font-weight: 500;
}

.gt-sector-count {
  font-size: 0.75rem;
  color: #6c757d;
}

.gt-sector-bar-bg {
  height: 7px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.gt-sector-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Donut */
.gt-donut-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
  font-size: 0.8rem;
}

.gt-donut-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.gt-donut-dot--green {
  background: #22c55e;
}
.gt-donut-dot--red {
  background: #ef4444;
}

.gt-donut-lbl {
  color: #374151;
}
.gt-donut-pct {
  font-weight: 700;
  color: #1e293b;
}

/* Evolution bars */
.gt-evolution-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.gt-evo-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gt-evo-year {
  font-size: 0.78rem;
  color: #6c757d;
  width: 32px;
  flex-shrink: 0;
  text-align: right;
}

.gt-evo-bar-bg {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.gt-evo-bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.gt-evo-pct {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  width: 34px;
  text-align: right;
  flex-shrink: 0;
}

.gt-evo-trend {
  font-size: 0.75rem;
  color: var(--color-primary, #2563eb);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

/* ── Graduate listing ───────────────────────────────────────────────────── */
.gt-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 14px;
}

/* Filtros dentro del datatable */
.gt-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
  margin-top: 8px;
  margin-bottom: 12px;
}

.gt-filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
}

/* Cell content */
.gt-grad-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gt-grad-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #e9ecef;
}

.gt-grad-initials {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #e9ecef;
}

.gt-grad-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
}

.gt-company-name {
  font-weight: 600;
  font-size: 0.83rem;
  color: var(--color-primary, #2563eb);
  margin: 0 0 1px;
}

.gt-company-role {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.gt-status-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.gt-badge--employed {
  background: #dcfce7;
  color: #15803d;
}
.gt-badge--unemployed {
  background: #fee2e2;
  color: #b91c1c;
}
.gt-badge--independent {
  background: #fef9c3;
  color: #b45309;
}
.gt-badge--studying {
  background: #ede9fe;
  color: #6d28d9;
}

.gt-td-updated {
  font-size: 0.78rem;
  color: #9ca3af;
  white-space: nowrap;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .gt-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
  .gt-charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .gt-kpis {
    grid-template-columns: 1fr;
  }
}
</style>
