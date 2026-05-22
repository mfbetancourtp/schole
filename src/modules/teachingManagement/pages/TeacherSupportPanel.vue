<template>
  <AppBaseList title="Panel de Soporte Docente">
    <template #content>
      <!-- Header -->
      <div class="pageHeader">
        <!-- <div class="pageHeader__left">
          <h2 class="pageHeader__title">Dashboard de Asistencia Docente</h2>
          <p class="pageHeader__subtitle">
            Análisis y seguimiento de asistencia del personal docente
          </p>
        </div> -->

        <div class="pageHeader__right">
          <AppButton type="button" class="exportBtn" @click="handleExport" :disabled="!isValidRange">
            <AppIcon icon="file-download" />
            Exportar Reporte
          </AppButton>
        </div>
      </div>

      <div class="pageBody">
        <!-- Filters -->
        <div class="filtersCard">
          <div class="filtersHead">
            <AppIcon icon="filter" class="filtersHead__icon" />
            <h3 class="filtersHead__title">Filtros de Búsqueda</h3>
          </div>

          <div class="filtersGrid">
            <div class="filterItem">
              <label class="filterLabel">Fecha Inicio</label>
              <div class="controlWithIcon">
                <AppIcon icon="calendar" class="controlIcon" />
                <input v-model="filters.startDate" class="filterControl w-100" type="date" />
              </div>
            </div>

            <div class="filterItem">
              <label class="filterLabel">Fecha Fin</label>
              <div class="controlWithIcon">
                <AppIcon icon="calendar" class="controlIcon" />
                <input v-model="filters.endDate" class="filterControl w-100" type="date" />
              </div>
            </div>

            <div class="filterItem">
              <label class="filterLabel">Facultad</label>
              <input v-model="filters.faculty" class="filterControl" placeholder="Ej: Ingeniería" type="text" />
            </div>

            <div class="filterItem">
              <label class="filterLabel">Docente</label>
              <input v-model="filters.teacher" class="filterControl" placeholder="Ej: Carlos Mendoza" type="text" />
            </div>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpiGrid">
          <div v-for="(kpi, i) in kpis" :key="i" class="kpiCard">
            <div class="kpiCard__top">
              <div class="kpiIconBox" :class="`kpiIconBox--${kpi.tone}`">
                <AppIcon :icon="kpi.icon" class="kpiIcon" :class="`kpiIcon--${kpi.tone}`" />
              </div>

              <div class="kpiTrend" :class="kpi.trend.isPositive ? 'kpiTrend--up' : 'kpiTrend--down'">
                <AppIcon :icon="kpi.trend.isPositive ? 'arrow-up' : 'arrow-down'" />
                {{ kpi.trend.value }}
              </div>
            </div>

            <div class="kpiCard__value">{{ kpi.value }}</div>
            <div class="kpiCard__title">{{ kpi.title }}</div>
            <div class="kpiCard__subtitle">{{ kpi.subtitle }}</div>
          </div>
        </div>

        <!-- Charts row 1 -->
        <div class="chartsGrid">
          <!-- Line chart -->
          <div class="chartCard">
            <div class="chartCard__head">
              <h3 class="chartCard__title">Tendencia de Puntualidad - Últimos 10 días</h3>
            </div>

            <apexchart type="line" height="320" :options="trendLineOptions" :series="trendLineSeries" />
          </div>

          <!-- Donut chart -->
          <div class="chartCard">
            <div class="chartCard__head">
              <h3 class="chartCard__title">Distribución de Asistencia</h3>
            </div>

            <div class="donutWrap">
              <apexchart type="donut" height="260" :options="donutOptions" :series="donutSeries" />

              <div class="donutLegend">
                <div class="legendRow">
                  <span class="dot dot--green"></span>
                  <span class="legendLabel">Puntuales</span>
                  <span class="legendValue">{{ donutSeries[0] }}%</span>
                </div>
                <div class="legendRow">
                  <span class="dot dot--amber"></span>
                  <span class="legendLabel">Retrasos</span>
                  <span class="legendValue">{{ donutSeries[1] }}%</span>
                </div>
                <div class="legendRow">
                  <span class="dot dot--red"></span>
                  <span class="legendLabel">Ausencias</span>
                  <span class="legendValue">{{ donutSeries[2] }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts row 2 -->
        <div class="chartsGrid">
          <!-- Bar chart -->
          <div class="chartCard">
            <div class="chartCard__head">
              <h3 class="chartCard__title">Asistencia por Facultad - Promedio Mensual</h3>
            </div>

            <apexchart type="bar" height="320" :options="facultyBarOptions" :series="facultyBarSeries" />
          </div>

          <!-- Ranking -->
          <div class="chartCard">
            <div class="rankingHead">
              <h3 class="chartCard__title">Ranking de Asistencia - Top 8</h3>
              <AppIcon icon="award" class="rankingHead__icon" />
            </div>

            <div class="rankingList">
              <div v-for="(r, idx) in ranking" :key="r.id" class="rankRow">
                <div class="rankLeft">
                  <div class="rankMedal" :class="medalClass(idx)">
                    {{ idx + 1 }}
                  </div>

                  <div class="rankInfo">
                    <div class="rankName">{{ r.name }}</div>
                    <div class="rankFaculty">{{ r.faculty }}</div>
                  </div>
                </div>

                <div class="rankRight">
                  <div class="rankScore">{{ r.score }}</div>
                  <div class="rankMini">
                    <span class="mini mini--amber">R: {{ r.delays }}</span>
                    <span class="mini mini--red">A: {{ r.absences }}</span>
                  </div>
                </div>

                <button type="button" class="rankAction" @click="viewTeacher(r)">
                  <AppIcon icon="eye" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Insights bottom -->
        <div class="insightsGrid">
          <div class="insightCard insightCard--green">
            <div class="insightHead">
              <div class="insightIcon insightIcon--green">
                <AppIcon icon="chart-line" />
              </div>
              <div class="insightTitle">Mejor Desempeño</div>
            </div>
            <div class="insightValue">Facultad de Ingeniería</div>
            <div class="insightSubtitle">95% de asistencia promedio mensual</div>
          </div>

          <div class="insightCard insightCard--amber">
            <div class="insightHead">
              <div class="insightIcon insightIcon--amber">
                <AppIcon icon="clock" />
              </div>
              <div class="insightTitle">Mayor Retraso</div>
            </div>
            <div class="insightValue">Martes 08:00 - 08:30</div>
            <div class="insightSubtitle">Horario con mayor incidencia de retrasos</div>
          </div>

          <div class="insightCard insightCard--blue">
            <div class="insightHead">
              <div class="insightIcon insightIcon--blue">
                <AppIcon icon="bookmark" />
              </div>
              <div class="insightTitle">Meta del Mes</div>
            </div>
            <div class="insightValue">95% Cumplida</div>
            <div class="insightSubtitle">Objetivo: 90% de asistencia general</div>
          </div>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Stores y Componentes
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { useHeaderStore } from '../../../stores/header.store';

dayjs.locale('es');

// Definición de tipos
type TeacherRank = {
  id: string;
  name: string;
  faculty: string;
  score: number;
  delays: number;
  absences: number;
};

export default defineComponent({
  name: 'TeacherSupportPanel',

  components: {
    AppBaseList,
    AppIcon,
    AppButton,
    apexchart: VueApexCharts,
  },

  setup() {
    const headerStorage = useHeaderStore();

    // --- STATE ---
    const filters = reactive({
      startDate: '',
      endDate: '',
      faculty: '',
      teacher: '',
    });

    /** --------- Mock Data --------- */
    const trendDates = ['01/02', '02/02', '03/02', '04/02', '05/02', '06/02', '07/02', '08/02', '09/02', '10/02'];
    const faculties = ['Ingeniería', 'Medicina', 'Derecho', 'Economía', 'Educación'];

    // --- COMPUTED ---
    const kpis = computed(() => [
      {
        title: 'Asistencias Completas',
        value: '94.6%',
        subtitle: '165 de 178 docentes',
        icon: 'check-circle',
        tone: 'success',
        trend: { value: '+5.2%', isPositive: true },
      },
      {
        title: 'Retrasos',
        value: '4.2%',
        subtitle: '7 docentes hoy',
        icon: 'clock',
        tone: 'warning',
        trend: { value: '+1.2%', isPositive: false },
      },
      {
        title: 'Inasistencias',
        value: '1.2%',
        subtitle: '2 docentes hoy',
        icon: 'exclamation-triangle',
        tone: 'danger',
        trend: { value: '-0.8%', isPositive: true },
      },
      {
        title: 'Total Docentes',
        value: '178',
        subtitle: 'Período activo',
        icon: 'users',
        tone: 'primary',
        trend: { value: '+2.1%', isPositive: true },
      },
    ]);

    const trendLineSeries = computed(() => [
      { name: 'Puntuales', data: [92, 94, 90, 93, 95, 92, 91, 94, 95, 96] },
      { name: 'Retrasos', data: [5, 4, 6, 5, 3, 4, 5, 6, 4, 3] },
      { name: 'Ausencias', data: [2, 2, 3, 2, 2, 1, 2, 2, 1, 1] },
    ]);

    const trendLineOptions = computed(() => ({
      chart: {
        type: 'line' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      dataLabels: { enabled: false },
      stroke: { width: 3, curve: 'smooth' as const },
      markers: { size: 4, hover: { size: 6 } },
      xaxis: {
        categories: trendDates,
        labels: { style: { colors: '#64748b', fontSize: '12px' } },
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { style: { colors: '#64748b', fontSize: '12px' } },
      },
      grid: { borderColor: '#e2e8f0' },
      legend: { position: 'bottom' as const, labels: { colors: '#334155' } },
      tooltip: { theme: 'light' },
    }));

    const donutSeries = computed(() => [85, 12, 3]);
    const donutOptions = computed(() => ({
      chart: {
        type: 'donut' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      labels: ['Puntuales', 'Retrasos', 'Ausencias'],
      legend: { show: false },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              total: { show: true, label: 'Total', formatter: () => '100%' },
            },
          },
        },
      },
      stroke: { width: 2, colors: ['#fff'] },
      tooltip: { theme: 'light' },
    }));

    const facultyBarSeries = computed(() => [{ name: 'Asistencia', data: [95, 92, 88, 90, 94] }]);

    const facultyBarOptions = computed(() => ({
      chart: {
        type: 'bar' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: faculties,
        labels: { style: { colors: '#64748b', fontSize: '12px' } },
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { style: { colors: '#64748b', fontSize: '12px' } },
      },
      grid: { borderColor: '#e2e8f0' },
      tooltip: { theme: 'light' },
    }));

    const ranking = computed<TeacherRank[]>(() => [
      {
        id: '1',
        name: 'Dr. Carlos Mendoza García',
        faculty: 'Ingeniería',
        score: 100,
        delays: 0,
        absences: 0,
      },
      {
        id: '2',
        name: 'Dra. María Elena Rodríguez',
        faculty: 'Medicina',
        score: 98,
        delays: 1,
        absences: 0,
      },
      {
        id: '3',
        name: 'Lic. Ana Patricia Torres',
        faculty: 'Economía',
        score: 97,
        delays: 1,
        absences: 0,
      },
      {
        id: '4',
        name: 'Mg. Laura Beatriz Campos',
        faculty: 'Educación',
        score: 96,
        delays: 2,
        absences: 0,
      },
      {
        id: '5',
        name: 'Dr. Andrés Felipe Ríos',
        faculty: 'Derecho',
        score: 95,
        delays: 2,
        absences: 1,
      },
    ]);

    const isValidRange = computed(() => {
      if (!filters.startDate || !filters.endDate) return true;
      return filters.startDate <= filters.endDate;
    });

    // --- METHODS ---
    const medalClass = (idx: number) => {
      if (idx === 0) return 'rankMedal--gold';
      if (idx === 1) return 'rankMedal--silver';
      if (idx === 2) return 'rankMedal--bronze';
      return 'rankMedal--gray';
    };

    const viewTeacher = (t: TeacherRank) => {
      console.log('View teacher:', t);
    };

    const toCsv = (rows: (string | number)[][]) => {
      return rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    };

    const handleExport = () => {
      const fileName = `reporte-asistencia-${dayjs().format('YYYY-MM-DD')}.csv`;
      const rows: (string | number)[][] = [
        ['Reporte', 'Asistencia Docente'],
        ['Generado', dayjs().format('YYYY-MM-DD HH:mm')],
        [],
        ['Filtros'],
        ['Fecha inicio', filters.startDate],
        ['Fecha fin', filters.endDate],
        [],
        ['Ranking'],
        ['#', 'Docente', 'Facultad', 'Score'],
      ];

      ranking.value.forEach((r, idx) => {
        rows.push([idx + 1, r.name, r.faculty, r.score]);
      });

      const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    // --- LIFECYCLE ---
    onMounted(() => {
      headerStorage.module = { name: 'Gestión Docente', url: '' };
      headerStorage.moduleItem = {
        name: 'Dashboard de asistencia docente',
        url: '',
      };
    });

    // --- RETURN ---
    return {
      filters,
      kpis,
      trendLineSeries,
      trendLineOptions,
      donutSeries,
      donutOptions,
      facultyBarSeries,
      facultyBarOptions,
      ranking,
      isValidRange,
      medalClass,
      viewTeacher,
      handleExport,
    };
  },
});
</script>

<style scoped>
.pageHeader {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 16px;
}
.pageHeader__left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pageHeader__title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}
.pageHeader__subtitle {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}
.exportBtn {
  border-radius: 12px !important;
  padding: 10px 14px !important;
}
.pageBody {
  padding: 18px 0 22px;
}

/* Filters */
.filtersCard {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  margin-bottom: 16px;
  box-shadow: 0 1px 0 rgba(2, 6, 23, 0.03);
}
.filtersHead {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.filtersHead__icon {
  color: #334155;
}
.filtersHead__title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.filtersGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 768px) {
  .filtersGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.filterItem {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filterLabel {
  font-size: 12px;
  font-weight: 800;
  color: #334155;
}
.filterControl {
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 12px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  background: #fff;
}
.filterControl:focus {
  border-color: rgba(var(--color-primary-rgb), 0.65);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.12);
}
.controlWithIcon {
  position: relative;
}
.controlWithIcon .filterControl {
  padding-left: 38px;
}
.controlIcon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

/* KPI */
.kpiGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 16px;
}
@media (min-width: 768px) {
  .kpiGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }
}
.kpiCard {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  box-shadow: 0 1px 0 rgba(2, 6, 23, 0.03);
}
.kpiCard__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.kpiIconBox {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpiIcon {
  font-size: 18px;
}
.kpiTrend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid transparent;
}
.kpiTrend--up {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.kpiTrend--down {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.kpiCard__value {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
}
.kpiCard__title {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 900;
  color: #334155;
}
.kpiCard__subtitle {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

/* Charts */
.chartsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 16px;

  /* ✅ clave: que las tarjetas se estiren igual */
  align-items: stretch;
}

@media (min-width: 1024px) {
  .chartsGrid {
    /* ✅ un poco más “imagen”: izquierda más grande */
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }
}
.chartCard {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 0 rgba(2, 6, 23, 0.03);

  /* ✅ clave: que el contenido interno controle el alto */
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 390px; /* parecido a tu captura (394px aprox) */
}

.chartCard__head {
  margin-bottom: 8px;
  flex: 0 0 auto;
}
.chartCard__title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
/* ✅ ApexCharts: que ocupe el espacio y no desborde */
.chartCard :deep(.apexcharts-canvas) {
  width: 100% !important;
}
.chartCard :deep(.apexcharts-svg),
.chartCard :deep(svg) {
  width: 100% !important;
}

/* Donut legend */
/* Donut legend (FIX para que quede como card derecha de la imagen) */
.donutWrap {
  /* ✅ en vez de grid, flex para controlar alto */
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* ✅ rellena lo que queda en la card */
  flex: 1 1 auto;
  min-height: 0;
}
/* Centra el donut dentro de la card */
.donutWrap :deep(.apexcharts-canvas) {
  margin: 0 auto;
}
/* ✅ limita la altura del donut para que no empuje la leyenda */
.donutWrap :deep(.apexcharts-canvas),
.donutWrap :deep(.apexcharts-inner) {
  max-height: 260px;
}

.donutLegend {
  margin-top: 6px;
  border-top: 1px dashed #e2e8f0;
  padding-top: 10px;

  display: flex;
  flex-direction: column;
  gap: 10px;

  /* ✅ leyenda siempre abajo sin romper */
  flex: 0 0 auto;
}
/* leyenda más “imagen”: columnas alineadas */
.legendRow {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 10px;
}

.legendLabel {
  font-size: 13px;
  font-weight: 800;
  color: #334155;
}

.legendValue {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
  min-width: 44px;
  text-align: right;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.dot--green {
  background: #10b981;
}
.dot--amber {
  background: #f59e0b;
}
.dot--red {
  background: #ef4444;
}
.legendLabel {
  font-size: 13px;
  font-weight: 800;
  color: #334155;
}
.legendValue {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
}

/* Ranking */
.rankingHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.rankingHead__icon {
  color: #f59e0b;
}
.rankingList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rankRow {
  border-radius: 12px;
  background: #f8fafc;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
}
.rankLeft {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.rankMedal {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 13px;
  flex-shrink: 0;
}
.rankMedal--gold {
  background: #fef3c7;
  color: #92400e;
}
.rankMedal--silver {
  background: #e5e7eb;
  color: #334155;
}
.rankMedal--bronze {
  background: #ffedd5;
  color: #9a3412;
}
.rankMedal--gray {
  background: #e2e8f0;
  color: #334155;
}
.rankInfo {
  min-width: 0;
}
.rankName {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rankFaculty {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.rankRight {
  text-align: right;
}
.rankScore {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.rankMini {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 4px;
}
.mini {
  font-size: 12px;
  font-weight: 900;
}
.mini--amber {
  color: #d97706;
}
.mini--red {
  color: #dc2626;
}
.rankAction {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.rankAction:hover {
  background: #f1f5f9;
}

/* Insights */
.insightsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 10px;
}
@media (min-width: 768px) {
  .insightsGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
}
.insightCard {
  border-radius: 14px;
  padding: 14px;
  border: 1px solid transparent;
}
.insightCard--green {
  background: #ecfdf5;
  border-color: #bbf7d0;
}
.insightCard--amber {
  background: #fffbeb;
  border-color: #fde68a;
}
.insightCard--blue {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.insightHead {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.insightIcon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.insightIcon--green {
  background: #dcfce7;
  color: #16a34a;
}
.insightIcon--amber {
  background: #fef3c7;
  color: #d97706;
}
.insightIcon--blue {
  background: #dbeafe;
  color: #2563eb;
}
.insightTitle {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
}
.insightValue {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.insightSubtitle {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

/* KPI tones */
.kpiIconBox--success {
  background: rgba(34, 197, 94, 0.14);
}
.kpiIcon--success {
  color: #16a34a;
}
.kpiIconBox--warning {
  background: rgba(245, 158, 11, 0.16);
}
.kpiIcon--warning {
  color: #d97706;
}
.kpiIconBox--danger {
  background: rgba(239, 68, 68, 0.14);
}
.kpiIcon--danger {
  color: #dc2626;
}
.kpiIconBox--primary {
  background: rgba(var(--color-primary-rgb), 0.12);
}
.kpiIcon--primary {
  color: var(--color-primary);
}
</style>
