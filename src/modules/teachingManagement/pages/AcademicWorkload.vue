<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:content>
      <AppLoading v-if="loading" />

      <template v-else>
        <div class="academic-workload-page">
          <!-- Header -->
          <div class="academic-workload-page__header">
            <div class="academic-workload-page__title-row">
              <div class="academic-workload-page__title-content">
                <h2 class="academic-workload-page__heading">Conteo de Horas Académicas</h2>
                <p class="academic-workload-page__subheading">Seguimiento y análisis de horas dictadas por los docentes</p>
              </div>

              <!-- Botón Exportar -->
              <AppButton label="Exportar Reporte" variant="primary" @click="handleExport">
                <AppIcon icon="cloud-download-alt" class="me-2" style="color: white" />
                Exportar Reporte
              </AppButton>
            </div>

            <!-- Filtros -->
            <div class="academic-workload-page__controls">
              <div class="academic-workload-page__filter-group">
                <label class="academic-workload-page__filter-label">Seleccionar Docente</label>
                <div class="academic-workload-page__search-wrapper">
                  <AppIcon icon="search" class="academic-workload-page__search-icon" />
                  <input type="text" class="form-control academic-workload-page__search-input" placeholder="Buscar por nombre o código..." v-model="searchTeacher" @input="onTeacherSearch" />
                </div>
              </div>

              <div class="academic-workload-page__filter-group">
                <label class="academic-workload-page__filter-label">Período</label>
                <div class="academic-workload-page__period-selector">
                  <button class="academic-workload-page__period-button" @click="previousMonth">
                    <AppIcon icon="chevron-left" />
                  </button>
                  <span class="academic-workload-page__period-text">{{ currentPeriod }}</span>
                  <button class="academic-workload-page__period-button" @click="nextMonth">
                    <AppIcon icon="chevron-right" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Teacher Info Card -->
          <div v-if="selectedTeacher" class="academic-workload-page__teacher-card">
            <div class="academic-workload-page__teacher-avatar">
              {{ selectedTeacher.initials }}
            </div>
            <div class="academic-workload-page__teacher-info">
              <h3 class="academic-workload-page__teacher-name">
                {{ selectedTeacher.name }}
              </h3>
              <p class="academic-workload-page__teacher-details">{{ selectedTeacher.department }} • {{ selectedTeacher.code }}</p>
            </div>
          </div>

          <!-- Stats Cards -->
          <div v-if="selectedTeacher" class="academic-workload-page__stats">
            <!-- Hours Taught -->
            <div class="academic-workload-page__stat-card">
              <div class="academic-workload-page__stat-icon" style="background-color: #e0f2fe; color: #0284c7">
                <AppIcon icon="clock" />
              </div>
              <div class="academic-workload-page__stat-content">
                <div class="academic-workload-page__stat-value">{{ workloadData.hoursTaught }}h</div>
                <div class="academic-workload-page__stat-label">Horas Dictadas</div>
                <div class="academic-workload-page__stat-sublabel">de {{ workloadData.hoursScheduled }}h programadas</div>
              </div>
              <div class="academic-workload-page__stat-trend" :class="{ positive: workloadData.hoursTrend > 0 }">
                <AppIcon icon="arrow-up" />
                {{ workloadData.hoursTrend }}%
              </div>
            </div>

            <!-- Compliance -->
            <div class="academic-workload-page__stat-card">
              <div class="academic-workload-page__stat-icon" style="background-color: #dcfce7; color: #10b981">
                <AppIcon icon="chart-line" />
              </div>
              <div class="academic-workload-page__stat-content">
                <div class="academic-workload-page__stat-value">{{ workloadData.compliance }}%</div>
                <div class="academic-workload-page__stat-label">Cumplimiento</div>
                <div class="academic-workload-page__stat-sublabel">Promedio del período</div>
              </div>
              <div class="academic-workload-page__stat-trend" :class="{ positive: workloadData.complianceTrend > 0 }">
                <AppIcon icon="arrow-up" />
                {{ workloadData.complianceTrend }}%
              </div>
            </div>

            <!-- Complete Days -->
            <div class="academic-workload-page__stat-card">
              <div class="academic-workload-page__stat-icon" style="background-color: #f3e8ff; color: #9333ea">
                <AppIcon icon="check-circle" />
              </div>
              <div class="academic-workload-page__stat-content">
                <div class="academic-workload-page__stat-value">{{ workloadData.completeDays }}/{{ workloadData.totalDays }}</div>
                <div class="academic-workload-page__stat-label">Días Completos</div>
                <div class="academic-workload-page__stat-sublabel">Esta semana</div>
              </div>
              <div class="academic-workload-page__stat-trend" :class="{ positive: workloadData.completeDaysTrend > 0 }">
                <AppIcon icon="arrow-up" />
                {{ workloadData.completeDaysTrend }}%
              </div>
            </div>

            <!-- Courses Alert -->
            <div class="academic-workload-page__stat-card">
              <div class="academic-workload-page__stat-icon" style="background-color: #fef3c7; color: #f59e0b">
                <AppIcon icon="exclamation-triangle" />
              </div>
              <div class="academic-workload-page__stat-content">
                <div class="academic-workload-page__stat-value">
                  {{ workloadData.alertCourses }}
                </div>
                <div class="academic-workload-page__stat-label">Cursos en Alerta</div>
                <div class="academic-workload-page__stat-sublabel">Requieren atención</div>
              </div>
              <div class="academic-workload-page__stat-trend negative" v-if="workloadData.alertCourses > 0">
                <AppIcon icon="arrow-up" />
                +{{ workloadData.alertCourses }}
              </div>
            </div>
          </div>

          <!-- Performance Alerts -->
          <div v-if="selectedTeacher && workloadData.alerts.length > 0" class="academic-workload-page__alerts">
            <div class="academic-workload-page__alerts-header">
              <AppIcon icon="exclamation-triangle" class="academic-workload-page__alerts-icon" />
              <h3 class="academic-workload-page__alerts-title">Alertas de Desempeño</h3>
            </div>
            <ul class="academic-workload-page__alerts-list">
              <li v-for="(alert, index) in workloadData.alerts" :key="index" class="academic-workload-page__alert-item">
                {{ alert }}
              </li>
            </ul>
          </div>

          <!-- Tabs -->
          <div v-if="selectedTeacher" class="academic-workload-page__tabs">
            <button v-for="tab in tabs" :key="tab.id" class="academic-workload-page__tab" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
              {{ tab.label }}
            </button>
          </div>

          <!-- Daily Detail Table (Vista Diaria) -->
          <div v-if="selectedTeacher && activeTab === 'daily'" class="academic-workload-page__table-card">
            <h3 class="academic-workload-page__table-title">
              <AppIcon icon="calendar-alt" class="me-2" />
              Detalle Diario
            </h3>
            <div class="academic-workload-page__table-wrapper">
              <table class="academic-workload-page__table">
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>DÍA</th>
                    <th>PROGRAMADAS</th>
                    <th>DICTADAS</th>
                    <th>CUMPLIMIENTO</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="day in workloadData.dailyDetail" :key="day.date">
                    <td>{{ day.date }}</td>
                    <td>{{ day.dayName }}</td>
                    <td>{{ day.scheduled }}</td>
                    <td class="academic-workload-page__table-link">
                      {{ day.taught }}
                    </td>
                    <td>
                      <div class="academic-workload-page__progress-bar">
                        <div
                          class="academic-workload-page__progress-fill"
                          :style="{
                            width: Math.min(day.compliance, 100) + '%',
                            backgroundColor: getComplianceColor(day.compliance),
                          }"
                        ></div>
                      </div>
                      <span class="academic-workload-page__progress-text">{{ day.compliance }}%</span>
                    </td>
                    <td>
                      <span class="academic-workload-page__badge" :class="'academic-workload-page__badge--' + day.status.toLowerCase()">
                        {{ day.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Weekly Comparison Chart (ApexCharts) -->
          <div v-if="selectedTeacher && (activeTab === 'weekly' || activeTab === 'daily' || activeTab === 'monthly')" class="academic-workload-page__chart-card">
            <h3 class="academic-workload-page__chart-title">
              <template v-if="activeTab === 'daily'">Comparativa Diaria: Horas Programadas vs Dictadas</template>
              <template v-else-if="activeTab === 'weekly'">Comparativa Semanal: Horas Programadas vs Dictadas</template>
              <template v-else>Comparativa Mensual: Horas Dictadas por Curso</template>
            </h3>
            <ChartComponent typeGraph="bar" :dataDashboard="chartSeries" :dataOptions="chartOptions" initialPalette="palette2" />
          </div>

          <!-- Daily Detail Table -->
          <div v-if="selectedTeacher && activeTab === 'weekly'" class="academic-workload-page__table-card">
            <h3 class="academic-workload-page__table-title">
              <AppIcon icon="calendar-alt" class="me-2" />
              Detalle por Día
            </h3>
            <div class="academic-workload-page__table-wrapper">
              <table class="academic-workload-page__table">
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>DÍA</th>
                    <th>PROGRAMADAS</th>
                    <th>DICTADAS</th>
                    <th>CUMPLIMIENTO</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="day in workloadData.dailyDetail" :key="day.date">
                    <td>{{ day.date }}</td>
                    <td>{{ day.dayName }}</td>
                    <td>{{ day.scheduled }}</td>
                    <td class="academic-workload-page__table-link">
                      {{ day.taught }}
                    </td>
                    <td>
                      <div class="academic-workload-page__progress-bar">
                        <div
                          class="academic-workload-page__progress-fill"
                          :style="{
                            width: Math.min(day.compliance, 100) + '%',
                            backgroundColor: getComplianceColor(day.compliance),
                          }"
                        ></div>
                      </div>
                      <span class="academic-workload-page__progress-text">{{ day.compliance }}%</span>
                    </td>
                    <td>
                      <span class="academic-workload-page__badge" :class="'academic-workload-page__badge--' + day.status.toLowerCase()">
                        {{ day.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Course Detail Table -->
          <div v-if="selectedTeacher && activeTab === 'monthly'" class="academic-workload-page__table-card">
            <h3 class="academic-workload-page__table-title">
              <AppIcon icon="chart-bar" class="me-2" />
              Detalle por Curso
            </h3>
            <div class="academic-workload-page__table-wrapper">
              <table class="academic-workload-page__table">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>CURSO</th>
                    <th>HORAS/SEM</th>
                    <th>HORAS DICTADAS</th>
                    <th>CLASES</th>
                    <th>RETRASOS</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="course in workloadData.courseDetail" :key="course.code">
                    <td>{{ course.code }}</td>
                    <td>{{ course.name }}</td>
                    <td>{{ course.hoursPerWeek }}</td>
                    <td class="academic-workload-page__table-link">
                      {{ course.hoursTaught }}
                    </td>
                    <td>{{ course.classes }}</td>
                    <td>
                      <span v-if="course.delays > 0" class="academic-workload-page__badge academic-workload-page__badge--warning">
                        <AppIcon icon="exclamation-triangle" class="me-1" />
                        {{ course.delays }}
                      </span>
                      <span v-else class="academic-workload-page__badge academic-workload-page__badge--success">
                        <AppIcon icon="check" class="me-1" />
                        {{ course.delays }}
                      </span>
                    </td>
                    <td>
                      <span class="academic-workload-page__badge" :class="'academic-workload-page__badge--' + course.status.toLowerCase()">
                        {{ course.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Period Summary -->
          <div v-if="selectedTeacher" class="academic-workload-page__summary">
            <div class="academic-workload-page__summary-header">
              <AppIcon icon="check-circle" class="academic-workload-page__summary-icon" />
              <h3 class="academic-workload-page__summary-title">Resumen del Período</h3>
            </div>
            <div class="academic-workload-page__summary-content">
              <div class="academic-workload-page__summary-item">
                <span class="academic-workload-page__summary-label">Total de Horas</span>
                <span class="academic-workload-page__summary-value">{{ workloadData.hoursTaught }}h de {{ workloadData.hoursScheduled }}h</span>
              </div>
              <div class="academic-workload-page__summary-item">
                <span class="academic-workload-page__summary-label">Cumplimiento Promedio</span>
                <span class="academic-workload-page__summary-value">{{ workloadData.compliance }}%</span>
              </div>
              <div class="academic-workload-page__summary-item">
                <span class="academic-workload-page__summary-label">Eficiencia</span>
                <span class="academic-workload-page__summary-value academic-workload-page__summary-value--success">Excelente</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ChartComponent from '@/shared/components/Card/chart.vue';
import AppBaseList from '@/shared/components/AppBaseList.vue';
import AppLoading from '@/shared/components/AppLoading.vue';
import AppButton from '@/shared/components/Buttons/AppButton.vue';
import AppIcon from '@/shared/components/AppIcon.vue';
import type { Teacher, WorkloadData } from '../dtos/academicWorkload.dto';

const title = 'Conteo de Horas Académicas';
const routes = [
  { name: 'Inicio', path: '/' },
  { name: 'Gestión Docente', path: '/teachingManagement' },
  { name: 'Conteo de Horas Académicas', path: '' },
];

const loading = ref(false);
const searchTeacher = ref('');
const selectedTeacher = ref<Teacher | null>(null);
const activeTab = ref('weekly');
const currentMonth = ref(2); // February
const currentYear = ref(2026);

// Datos para el gráfico de barras semanal (ApexCharts)

// Datos para el gráfico según la vista activa
const chartSeries = computed(() => {
  if (activeTab.value === 'daily') {
    return [
      {
        name: 'Programadas',
        data: workloadData.value.dailyDetail.map((d) => parseFloat(d.scheduled)),
      },
      {
        name: 'Dictadas',
        data: workloadData.value.dailyDetail.map((d) => parseFloat(d.taught)),
      },
    ];
  } else if (activeTab.value === 'weekly') {
    return [
      {
        name: 'Programadas',
        data: workloadData.value.weeklyData.map((d) => d.scheduled),
      },
      {
        name: 'Dictadas',
        data: workloadData.value.weeklyData.map((d) => d.taught),
      },
    ];
  } else if (activeTab.value === 'monthly') {
    // Ejemplo: sumar horas por curso para el mes
    return [
      {
        name: 'Dictadas',
        data: workloadData.value.courseDetail.map((c) => parseFloat(c.hoursTaught)),
      },
    ];
  }
  return [];
});

const chartOptions = computed(() => {
  if (activeTab.value === 'daily') {
    return {
      chart: { type: 'bar', stacked: false, toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: false, columnWidth: '40%', borderRadius: 4 },
      },
      dataLabels: { enabled: true },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: {
        categories: workloadData.value.dailyDetail.map((d) => d.date),
        labels: { style: { fontWeight: 600 } },
      },
      yaxis: { title: { text: 'Horas' }, min: 0, forceNiceScale: true },
      fill: { opacity: 0.9 },
      colors: ['#93c5fd', '#3b82f6'],
      legend: { position: 'top', horizontalAlign: 'center' },
      tooltip: { y: { formatter: (val: number) => `${val}h` } },
    };
  } else if (activeTab.value === 'weekly') {
    return {
      chart: { type: 'bar', stacked: false, toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: false, columnWidth: '40%', borderRadius: 4 },
      },
      dataLabels: { enabled: true },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: {
        categories: workloadData.value.weeklyData.map((d) => d.day),
        labels: { style: { fontWeight: 600 } },
      },
      yaxis: { title: { text: 'Horas' }, min: 0, forceNiceScale: true },
      fill: { opacity: 0.9 },
      colors: ['#93c5fd', '#3b82f6'],
      legend: { position: 'top', horizontalAlign: 'center' },
      tooltip: { y: { formatter: (val: number) => `${val}h` } },
    };
  } else if (activeTab.value === 'monthly') {
    return {
      chart: { type: 'bar', stacked: false, toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: false, columnWidth: '40%', borderRadius: 4 },
      },
      dataLabels: { enabled: true },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: {
        categories: workloadData.value.courseDetail.map((c) => c.name),
        labels: { style: { fontWeight: 600 } },
      },
      yaxis: {
        title: { text: 'Horas Dictadas' },
        min: 0,
        forceNiceScale: true,
      },
      fill: { opacity: 0.9 },
      colors: ['#3b82f6'],
      legend: { position: 'top', horizontalAlign: 'center' },
      tooltip: { y: { formatter: (val: number) => `${val}h` } },
    };
  }
  return {};
});

const tabs = [
  { id: 'daily', label: 'Vista Diaria' },
  { id: 'weekly', label: 'Vista Semanal' },
  { id: 'monthly', label: 'Vista Mensual' },
];

const currentPeriod = computed(() => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${months[currentMonth.value - 1]} ${currentYear.value}`;
});

// Mock data basada en la imagen
const workloadData = ref<WorkloadData>({
  hoursTaught: 24,
  hoursScheduled: 24,
  hoursTrend: 5.2,
  compliance: 100.0,
  complianceTrend: 2.1,
  completeDays: 3,
  totalDays: 5,
  completeDaysTrend: 8.3,
  alertCourses: 1,
  alerts: ['1 curso(s) con cumplimiento por debajo del esperado', 'Se detectaron retrasos recurrentes en el curso "Desarrollo Web"', 'Revisa la sección de detalle por curso para más información'],
  weeklyData: [
    { day: 'Lunes', scheduled: 6, taught: 6 },
    { day: 'Martes', scheduled: 4, taught: 4 },
    { day: 'Miércoles', scheduled: 6, taught: 5.5 },
    { day: 'Jueves', scheduled: 4, taught: 4 },
    { day: 'Viernes', scheduled: 4, taught: 4.5 },
  ],
  dailyDetail: [
    {
      date: '03/02',
      dayName: 'Lunes',
      scheduled: '6h',
      taught: '6h',
      compliance: 100,
      status: 'Completo',
    },
    {
      date: '04/02',
      dayName: 'Martes',
      scheduled: '4h',
      taught: '4h',
      compliance: 100,
      status: 'Completo',
    },
    {
      date: '05/02',
      dayName: 'Miércoles',
      scheduled: '6h',
      taught: '5.5h',
      compliance: 91.7,
      status: 'Incompleto',
    },
    {
      date: '06/02',
      dayName: 'Jueves',
      scheduled: '4h',
      taught: '4h',
      compliance: 100,
      status: 'Completo',
    },
    {
      date: '07/02',
      dayName: 'Viernes',
      scheduled: '4h',
      taught: '4.5h',
      compliance: 112.5,
      status: 'Excedido',
    },
  ],
  courseDetail: [
    {
      code: 'ING-101',
      name: 'Programación I',
      hoursPerWeek: '6h',
      hoursTaught: '24h',
      classes: '12/12',
      delays: 0,
      status: 'Excelente',
    },
    {
      code: 'ING-201',
      name: 'Base de Datos',
      hoursPerWeek: '6h',
      hoursTaught: '22h',
      classes: '11/12',
      delays: 1,
      status: 'Bueno',
    },
    {
      code: 'ING-301',
      name: 'Desarrollo Web',
      hoursPerWeek: '4h',
      hoursTaught: '14h',
      classes: '7/12',
      delays: 3,
      status: 'Alerta',
    },
  ],
});

const maxWeeklyHours = computed(() => {
  return Math.max(...workloadData.value.weeklyData.map((d) => Math.max(d.scheduled, d.taught)));
});

onMounted(() => {
  // Seleccionar automáticamente el docente mostrado en la imagen
  selectedTeacher.value = {
    id: 1,
    name: 'Dr. Carlos Mendoza García',
    code: 'DOC-2024-001',
    department: 'Ingeniería',
    initials: 'DC',
  };
});

const onTeacherSearch = () => {
  // TODO: Implementar búsqueda de docentes
};

const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const handleExport = () => {
  // TODO: Implementar exportación de reporte
  console.log('Exportar reporte');
};

const getComplianceColor = (compliance: number): string => {
  if (compliance >= 100) return '#10b981';
  if (compliance >= 90) return '#3b82f6';
  if (compliance >= 70) return '#f59e0b';
  return '#ef4444';
};
</script>

<style scoped lang="scss">
.academic-workload-page {
  &__header {
    background: #ffffff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &__title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  &__title-content {
    flex: 1;
  }

  &__heading {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  &__subheading {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  &__controls {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
  }

  &__filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__filter-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  &__search-wrapper {
    position: relative;
  }

  &__search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 16px;
  }

  &__search-input {
    padding-left: 40px;
  }

  &__period-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 8px 12px;
  }

  &__period-button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #374151;
    }
  }

  &__period-text {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    min-width: 150px;
    text-align: center;
  }

  &__teacher-card {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-radius: 8px;
    padding: 16px 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__teacher-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #3b82f6;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
  }

  &__teacher-name {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  &__teacher-details {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  &__stat-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    position: relative;
  }

  &__stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  &__stat-content {
    flex: 1;
  }

  &__stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
    margin-bottom: 4px;
  }

  &__stat-label {
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 2px;
  }

  &__stat-sublabel {
    font-size: 12px;
    color: #9ca3af;
  }

  &__stat-trend {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 12px;
    font-weight: 600;
    color: #10b981;
    display: flex;
    align-items: center;
    gap: 2px;

    &.positive {
      color: #10b981;
    }

    &.negative {
      color: #ef4444;
    }
  }

  &__alerts {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 24px;
  }

  &__alerts-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__alerts-icon {
    color: #f59e0b;
    font-size: 18px;
  }

  &__alerts-title {
    font-size: 16px;
    font-weight: 600;
    color: #92400e;
    margin: 0;
  }

  &__alerts-list {
    margin: 0;
    padding-left: 24px;
    color: #92400e;
    font-size: 14px;
  }

  &__alert-item {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__tabs {
    display: flex;
    gap: 4px;
    background: #f9fafb;
    padding: 4px;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  &__tab {
    flex: 1;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #374151;
    }

    &.active {
      background: #ffffff;
      color: #3b82f6;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  }

  &__chart-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &__chart-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 24px 0;
  }

  &__chart {
    padding: 0 16px;
  }

  &__chart-bars {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 200px;
    margin-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 16px;
  }

  &__chart-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  &__chart-bar-group {
    display: flex;
    gap: 4px;
    align-items: flex-end;
    height: 100%;
  }

  &__chart-bar {
    width: 32px;
    border-radius: 4px 4px 0 0;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }

    &--scheduled {
      background: #93c5fd;
    }

    &--taught {
      background: #3b82f6;
    }
  }

  &__chart-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  &__chart-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 16px;
  }

  &__chart-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #6b7280;
  }

  &__chart-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 2px;

    &--scheduled {
      background: #93c5fd;
    }

    &--taught {
      background: #3b82f6;
    }
  }

  &__table-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &__table-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
  }

  &__table-wrapper {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    td {
      padding: 16px;
      font-size: 14px;
      color: #374151;
      border-bottom: 1px solid #f3f4f6;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  &__table-link {
    color: #3b82f6;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__progress-bar {
    width: 120px;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    display: inline-block;
    vertical-align: middle;
    margin-right: 8px;
  }

  &__progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }

  &__progress-text {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;

    &--completo {
      background: #dcfce7;
      color: #166534;
    }

    &--incompleto {
      background: #fef3c7;
      color: #92400e;
    }

    &--excedido {
      background: #dbeafe;
      color: #1e40af;
    }

    &--excelente {
      background: #dcfce7;
      color: #166534;
    }

    &--bueno {
      background: #dbeafe;
      color: #1e40af;
    }

    &--alerta {
      background: #fee2e2;
      color: #991b1b;
    }

    &--success {
      background: #dcfce7;
      color: #166534;
    }

    &--warning {
      background: #fef3c7;
      color: #92400e;
    }
  }

  &__summary {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    border-radius: 8px;
    padding: 20px 24px;
  }

  &__summary-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__summary-icon {
    color: #10b981;
    font-size: 20px;
  }

  &__summary-title {
    font-size: 16px;
    font-weight: 600;
    color: #065f46;
    margin: 0;
  }

  &__summary-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  &__summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__summary-label {
    font-size: 13px;
    color: #065f46;
    font-weight: 500;
  }

  &__summary-value {
    font-size: 20px;
    font-weight: 700;
    color: #064e3b;

    &--success {
      color: #10b981;
    }
  }
}

@media (max-width: 1200px) {
  .academic-workload-page__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .academic-workload-page__stats {
    grid-template-columns: 1fr;
  }

  .academic-workload-page__controls {
    grid-template-columns: 1fr;
  }

  .academic-workload-page__summary-content {
    grid-template-columns: 1fr;
  }
}
</style>
