<template>
  <AppBaseList title="Conteo de Horas Académicas">
    <template #content>
      <!-- Header -->
      <div class="pageHeader">
        <!-- <div class="pageHeader__left">
          <h2 class="pageHeader__title">Conteo de Horas Académicas</h2>
          <p class="pageHeader__subtitle">
            Seguimiento y análisis de horas dictadas por los docentes
          </p>
        </div> -->

        <div class="pageHeader__right">
          <AppButton type="button" class="exportBtn" @click="handleExport">
            <AppIcon icon="file-download" />
            Exportar Reporte
          </AppButton>
        </div>
      </div>

      <div class="pageBody">
        <!-- Selection Panel -->
        <div class="filtersCard">
          <div class="filtersGrid filtersGrid--2">
            <!-- Buscar Docente -->
            <div class="filterItem">
              <label class="filterLabel">Seleccionar Docente</label>

              <div class="tw-relative">
                <span class="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-slate-400">
                  <AppIcon icon="search" />
                </span>

                <input v-model="searchDocente" class="filterControl tw-pl-10" placeholder="Buscar por nombre o código..." type="text" />
              </div>

              <div v-if="searchDocente && filteredDocentes.length" class="tw-mt-2 tw-border tw-border-slate-200 tw-rounded-xl tw-max-h-48 tw-overflow-y-auto tw-bg-white">
                <button
                  v-for="doc in filteredDocentes"
                  :key="doc.id"
                  type="button"
                  class="tw-w-full tw-p-3 tw-text-left hover:tw-bg-blue-50 tw-border-b tw-border-slate-200 last:tw-border-0 tw-transition-colors"
                  @click="selectDocente(doc)"
                >
                  <p class="tw-font-semibold tw-text-slate-900">
                    {{ doc.nombre }}
                  </p>
                  <p class="tw-text-sm tw-text-slate-600">{{ doc.facultad }} • {{ doc.codigo }}</p>
                </button>
              </div>
            </div>

            <!-- Periodo -->
            <div class="filterItem">
              <label class="filterLabel">Periodo</label>

              <div class="periodRow">
                <button class="periodBtn" type="button" @click="prevPeriod">
                  <AppIcon icon="chevron-left" />
                </button>

                <div class="periodValue">
                  <AppIcon icon="calendar" class="periodValue__icon" />
                  <span>{{ currentPeriod }}</span>
                </div>

                <button class="periodBtn" type="button" @click="nextPeriod">
                  <AppIcon icon="chevron-right" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Docente Info -->
        <div v-if="selectedDocente" class="teacherCard">
          <AppAvatar :avatar="selectedDocente.avatarUrl" :name="selectedDocente.nombre" size="md" />

          <div class="teacherCard__info">
            <div class="teacherCard__name">{{ selectedDocente.nombre }}</div>
            <div class="teacherCard__meta">{{ selectedDocente.facultad }} • {{ selectedDocente.codigo }}</div>
          </div>
        </div>

        <!-- KPIs (reutiliza AppCardDashboard) -->
        <div class="cards-dashboard-container">
          <AppCardDashboard v-for="(card, index) in statsCards" :key="index" class="container-custom-card" :style="{ backgroundColor: '#FFFFFF' }">
            <template #title>
              <span class="dashCard__title">{{ card.title }}</span>
            </template>

            <template #body>
              <div class="dashCard__body">
                <div class="dashCard__left">
                  <h3 class="dashCard__value">{{ card.value }}</h3>
                  <p v-if="card.subtitle" class="dashCard__subtitle">
                    {{ card.subtitle }}
                  </p>
                </div>

                <div class="dashCard__iconBox" :class="`dashCard__iconBox--${card.tone}`">
                  <AppIcon class="dashCard__icon" :class="`dashCard__icon--${card.tone}`" :icon="card.icon" />
                </div>
              </div>
            </template>
          </AppCardDashboard>
        </div>

        <!-- Alertas -->
        <div v-if="cursosConAlerta > 0" class="alertCard">
          <div class="alertCard__icon">
            <AppIcon icon="exclamation-triangle" />
          </div>
          <div class="alertCard__content">
            <div class="alertCard__title">Alertas de Desempeño</div>
            <ul class="alertCard__list">
              <li>• {{ cursosConAlerta }} curso(s) con cumplimiento por debajo del esperado</li>
              <li>• Se detectaron retrasos recurrentes en el curso “Desarrollo Web”</li>
              <li>• Revisa el detalle por curso para más información</li>
            </ul>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabsCard">
          <div class="tabsHead">
            <button class="tabBtn" :class="{ 'tabBtn--active': vistaActiva === 'diaria' }" type="button" @click="vistaActiva = 'diaria'">Vista Diaria</button>
            <button class="tabBtn" :class="{ 'tabBtn--active': vistaActiva === 'semanal' }" type="button" @click="vistaActiva = 'semanal'">Vista Semanal</button>
            <button class="tabBtn" :class="{ 'tabBtn--active': vistaActiva === 'mensual' }" type="button" @click="vistaActiva = 'mensual'">Vista Mensual</button>
          </div>

          <div class="tabsBody">
            <!-- Vista Semanal -->
            <template v-if="vistaActiva === 'semanal'">
              <!-- Chart placeholder (conserva el layout) -->
              <div class="container-graph">
                <div class="content-header">
                  <div class="tw-flex tw-items-center tw-justify-between tw-gap-3">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <AppIcon icon="chart-area" />
                      <span class="tw-font-extrabold"> Comparativa Semanal: Horas Programadas vs Dictadas </span>
                    </div>
                  </div>

                  <div class="controls">
                    <div class="control-item">
                      <label><b>Tipo de gráfica</b></label>
                      <select @change="updateType" :value="chartType">
                        <option value="area">Área</option>
                        <option value="line">Línea</option>
                        <option value="bar">Barra</option>
                      </select>
                    </div>

                    <div class="control-item">
                      <label><b>Paleta</b></label>
                      <select @change="updateTheme" :value="currentPalette">
                        <option v-for="n in 10" :key="n" :value="`palette${n}`">Paleta {{ n }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <VueApexCharts :key="chartType" :type="chartType" width="100%" height="350" :options="weeklyChartOptions" :series="weeklySeries" />
              </div>

              <h5 class="tw-mt-6">Detalle por Día</h5>
              <div class="tableCard">
                <DataTable
                  :value="registroSemanal"
                  responsiveLayout="scroll"
                  dataKey="fecha"
                  :paginator="registroSemanal.length > 0"
                  :rows="10"
                  :rowsPerPageOptions="[10, 20, 50]"
                  class="payslipsTable"
                >
                  <template #empty>
                    <div class="tw-py-10">
                      <AppEmptyResponse title="Sin resultados" description="No hay registros con los filtros actuales." />
                    </div>
                  </template>

                  <Column field="fecha" header="FECHA" headerClass="th" bodyClass="td" />
                  <Column field="dia" header="DÍA" headerClass="th" bodyClass="td" />

                  <Column header="PROGRAMADAS" headerClass="th" bodyClass="td">
                    <template #body="{ data }">{{ data.horasProgramadas }}h</template>
                  </Column>

                  <Column header="DICTADAS" headerClass="th" bodyClass="td">
                    <template #body="{ data }">
                      <span class="tw-font-semibold tw-text-blue-600"> {{ data.horasDictadas }}h </span>
                    </template>
                  </Column>

                  <Column header="CUMPLIMIENTO" headerClass="th" bodyClass="td">
                    <template #body="{ data }">
                      <div class="tw-flex tw-items-center tw-gap-2">
                        <div class="tw-flex-1 tw-max-w-[120px] tw-bg-slate-200 tw-rounded-full tw-h-2">
                          <div
                            class="tw-h-2 tw-rounded-full"
                            :class="cumplimientoBarClass(data.cumplimiento)"
                            :style="{
                              width: `${Math.min(data.cumplimiento, 100)}%`,
                            }"
                          />
                        </div>
                        <span class="tw-text-sm tw-font-semibold tw-text-slate-900 tw-min-w-[56px]"> {{ Number(data.cumplimiento).toFixed(1) }}% </span>
                      </div>
                    </template>
                  </Column>

                  <Column header="ESTADO" headerClass="th" bodyClass="td">
                    <template #body="{ data }">
                      <span class="badge" :class="estadoBadgeClass(data.estado)">
                        {{ estadoBadgeLabel(data.estado) }}
                      </span>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </template>

            <!-- Vista Mensual -->
            <template v-else-if="vistaActiva === 'mensual'">
              <div class="sectionTitle">Tendencia Mensual por Semana</div>

              <div class="container-graph">
                <div class="content-header">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <AppIcon icon="chart-line" />
                    <span class="tw-font-extrabold"> Tendencia Mensual </span>
                  </div>
                </div>

                <VueApexCharts type="line" width="100%" height="350" :options="monthlyChartOptions" :series="monthlySeries" />
              </div>

              <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4 tw-mt-6">
                <div v-for="(s, idx) in registroMensual" :key="idx" class="weekCard">
                  <div class="weekCard__k">{{ s.semana }}</div>
                  <div class="weekCard__v">{{ s.dictadas }}h</div>
                  <div class="weekCard__sub">de {{ s.programadas }}h programadas</div>

                  <div class="tw-flex tw-items-center tw-gap-2 tw-mt-2">
                    <div class="tw-flex-1 tw-bg-slate-200 tw-rounded-full tw-h-2">
                      <div class="tw-h-2 tw-rounded-full" :class="cumplimientoBarClass(s.cumplimiento)" :style="{ width: `${Math.min(s.cumplimiento, 100)}%` }" />
                    </div>
                    <span class="tw-text-xs tw-font-semibold tw-text-slate-900"> {{ Number(s.cumplimiento).toFixed(0) }}% </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Vista Diaria -->
            <template v-else>
              <div class="emptyState">
                <AppIcon icon="calendar" class="emptyState__icon" />
                <div class="emptyState__title">Vista diaria disponible próximamente</div>
                <div class="emptyState__desc">Selecciona “Vista Semanal” para ver el detalle diario</div>
              </div>
            </template>
          </div>
        </div>

        <!-- Detalle por Curso -->
        <div class="tw-mt-6 tableCard tw-p-0">
          <div class="tableHead">
            <div class="tableHead__title">
              <AppIcon icon="chart-bar" />
              <h5 class="m-0">Detalle por Curso</h5>
            </div>
          </div>

          <DataTable :value="registroPorCurso" responsiveLayout="scroll" dataKey="codigo" :paginator="registroPorCurso.length > 0" :rows="10" :rowsPerPageOptions="[10, 20, 50]" class="payslipsTable">
            <Column field="codigo" header="CÓDIGO" headerClass="th" bodyClass="td" />
            <Column field="nombre" header="CURSO" headerClass="th" bodyClass="td" />

            <Column header="HORAS/SEM" headerClass="th" bodyClass="td">
              <template #body="{ data }">{{ data.horasSemanalesProgramadas }}h</template>
            </Column>

            <Column header="HORAS DICTADAS" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <span class="tw-font-semibold tw-text-blue-600">{{ data.horasDictadas }}h</span>
              </template>
            </Column>

            <Column header="CLASES" headerClass="th" bodyClass="td">
              <template #body="{ data }">{{ data.clasesCompletadas }}/{{ data.clasesTotales }}</template>
            </Column>

            <Column header="RETRASOS" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <span v-if="data.retrasos > 0" class="tw-inline-flex tw-items-center tw-gap-1 tw-text-sm tw-font-semibold tw-text-amber-600">
                  <AppIcon icon="exclamation-triangle" />
                  {{ data.retrasos }}
                </span>
                <span v-else class="tw-inline-flex tw-items-center tw-gap-1 tw-text-sm tw-font-semibold tw-text-green-600">
                  <AppIcon icon="check-circle" />
                  0
                </span>
              </template>
            </Column>

            <Column header="ESTADO" headerClass="th" bodyClass="td">
              <template #body="{ data }">
                <span class="badge" :class="estadoCursoBadgeClass(data.estado)">
                  {{ estadoCursoBadgeLabel(data.estado) }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Summary -->
        <div class="summaryCard">
          <div class="summaryCard__icon">
            <AppIcon icon="check-circle" />
          </div>
          <div class="summaryCard__content">
            <div class="summaryCard__title">Resumen del Periodo</div>

            <div class="summaryGrid">
              <div>
                <div class="summaryK">Total de Horas</div>
                <div class="summaryV">{{ totalDictadas }}h de {{ totalProgramadas }}h</div>
              </div>

              <div>
                <div class="summaryK">Cumplimiento Promedio</div>
                <div class="summaryV">{{ cumplimientoPromedio.toFixed(1) }}%</div>
              </div>

              <div>
                <div class="summaryK">Eficiencia</div>
                <div class="summaryV">
                  {{ cumplimientoPromedio >= 95 ? 'Excelente' : 'Buena' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';

// Componentes locales/internos
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import VueApexCharts from 'vue3-apexcharts';

// PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted } from 'vue';
import { useHeaderStore } from '../../../stores/header.store';

// Tipos
type Docente = {
  id: string;
  nombre: string;
  codigo: string;
  facultad: string;
  avatarUrl?: string;
};
type RegistroDiario = {
  fecha: string;
  dia: string;
  horasProgramadas: number;
  horasDictadas: number;
  cumplimiento: number;
  estado: 'completo' | 'incompleto' | 'excedido';
};
type RegistroCurso = {
  codigo: string;
  nombre: string;
  horasSemanalesProgramadas: number;
  horasDictadas: number;
  clasesCompletadas: number;
  clasesTotales: number;
  retrasos: number;
  estado: 'excelente' | 'bueno' | 'alerta' | 'critico';
};

export default defineComponent({
  name: 'AcademicWorkloadTeacher',

  // 1. Registro de componentes para el template
  components: {
    AppBaseList,
    AppButton,
    AppIcon,
    AppAvatar,
    AppEmptyResponse,
    AppCardDashboard,
    DataTable,
    Column,
    VueApexCharts, // Usamos el nombre original o 'apexchart'
  },

  setup() {
    const title = 'Conteo de horas académicas';

    // --- STATE (Refs) ---
    const mockDocentes: Docente[] = [
      {
        id: '1',
        nombre: 'Carvajal Niño Martha Carolina',
        codigo: 'DOC-2026-01',
        facultad: 'Ciencias e Ingeniería',
        avatarUrl: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/test/75/2026/avatar/1773093501468.jpg',
      },
    ];

    const registroSemanal = ref<RegistroDiario[]>([
      {
        fecha: '03/02',
        dia: 'Lunes',
        horasProgramadas: 3,
        horasDictadas: 3,
        cumplimiento: 100,
        estado: 'completo',
      },
      {
        fecha: '04/02',
        dia: 'Martes',
        horasProgramadas: 3,
        horasDictadas: 3,
        cumplimiento: 100,
        estado: 'completo',
      },
      {
        fecha: '05/02',
        dia: 'Miércoles',
        horasProgramadas: 3,
        horasDictadas: 2.5,
        cumplimiento: 83.3,
        estado: 'incompleto',
      },
      {
        fecha: '06/02',
        dia: 'Jueves',
        horasProgramadas: 3,
        horasDictadas: 3,
        cumplimiento: 100,
        estado: 'completo',
      },
      {
        fecha: '07/02',
        dia: 'Viernes',
        horasProgramadas: 3,
        horasDictadas: 3.5,
        cumplimiento: 116.7,
        estado: 'excedido',
      },
    ]);

    const registroMensual = ref([
      { semana: 'Sem 1', programadas: 15, dictadas: 14.5, cumplimiento: 96.7 },
      { semana: 'Sem 2', programadas: 15, dictadas: 15, cumplimiento: 100 },
      { semana: 'Sem 3', programadas: 15, dictadas: 13.5, cumplimiento: 90 },
      { semana: 'Sem 4', programadas: 15, dictadas: 15, cumplimiento: 100 },
    ]);

    const registroPorCurso = ref<RegistroCurso[]>([
      {
        codigo: 'CG-101',
        nombre: 'Fundamentos',
        horasSemanalesProgramadas: 3,
        horasDictadas: 12,
        clasesCompletadas: 4,
        clasesTotales: 4,
        retrasos: 0,
        estado: 'excelente',
      },
      {
        codigo: 'CG-102',
        nombre: 'Sistema Nacional de Control',
        horasSemanalesProgramadas: 3,
        horasDictadas: 11,
        clasesCompletadas: 4,
        clasesTotales: 4,
        retrasos: 1,
        estado: 'bueno',
      },
      {
        codigo: 'CG-103',
        nombre: 'Gestión pública moderna',
        horasSemanalesProgramadas: 3,
        horasDictadas: 10,
        clasesCompletadas: 3,
        clasesTotales: 4,
        retrasos: 2,
        estado: 'alerta',
      },
      {
        codigo: 'CG-104',
        nombre: 'Marco normativo del control',
        horasSemanalesProgramadas: 3,
        horasDictadas: 12,
        clasesCompletadas: 4,
        clasesTotales: 4,
        retrasos: 0,
        estado: 'excelente',
      },
      {
        codigo: 'CG-105',
        nombre: 'Ética y responsabilidad pública',
        horasSemanalesProgramadas: 3,
        horasDictadas: 11.5,
        clasesCompletadas: 4,
        clasesTotales: 4,
        retrasos: 1,
        estado: 'bueno',
      },
    ]);

    const chartType = ref<'area' | 'line' | 'bar'>('bar');
    const currentPalette = ref('palette1');
    const selectedDocente = ref<Docente | null>(mockDocentes[0]);
    const searchDocente = ref('');
    const vistaActiva = ref<'diaria' | 'semanal' | 'mensual'>('semanal');
    const currentPeriod = ref('Febrero 2026');

    // --- COMPUTED ---
    const filteredDocentes = computed(() => {
      const term = searchDocente.value.trim().toLowerCase();
      if (!term) return mockDocentes;
      return mockDocentes.filter((d) => d.nombre.toLowerCase().includes(term) || d.codigo.toLowerCase().includes(term));
    });

    const weeklySeries = computed(() => [
      {
        name: 'Programadas',
        data: registroSemanal.value.map((r) => r.horasProgramadas),
      },
      {
        name: 'Dictadas',
        data: registroSemanal.value.map((r) => r.horasDictadas),
      },
    ]);

    const weeklyChartOptions = computed(() => ({
      chart: {
        type: chartType.value,
        toolbar: { show: true },
        zoom: { enabled: true },
      },
      theme: { palette: currentPalette.value },
      stroke: {
        width: chartType.value === 'bar' ? 0 : 3,
        curve: 'smooth' as const,
      },
      dataLabels: { enabled: false },
      legend: { position: 'top' as const },
      grid: { borderColor: '#e5e7eb' },
      xaxis: { categories: registroSemanal.value.map((r) => r.dia) },
      tooltip: { shared: true, intersect: false },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
    }));

    const monthlySeries = computed(() => [
      {
        name: 'Horas Dictadas',
        data: registroMensual.value.map((r) => r.dictadas),
      },
    ]);

    const monthlyChartOptions = computed(() => ({
      chart: { type: 'line' as const, toolbar: { show: true } },
      theme: { palette: currentPalette.value },
      stroke: { width: 3, curve: 'smooth' as const },
      dataLabels: { enabled: false },
      xaxis: { categories: registroMensual.value.map((r) => r.semana) },
    }));

    const docenteInitials = computed(() => {
      if (!selectedDocente.value) return '';
      return selectedDocente.value.nombre
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    });
    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Gestión docentes', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });
    // KPIs
    const totalProgramadas = computed(() => registroSemanal.value.reduce((sum, r) => sum + r.horasProgramadas, 0));
    const totalDictadas = computed(() => registroSemanal.value.reduce((sum, r) => sum + r.horasDictadas, 0));
    const cumplimientoPromedio = computed(() => (totalProgramadas.value > 0 ? (totalDictadas.value / totalProgramadas.value) * 100 : 0));
    const diasCompletos = computed(() => registroSemanal.value.filter((r) => r.estado === 'completo').length);
    const cursosConAlerta = computed(() => registroPorCurso.value.filter((c) => c.estado === 'alerta' || c.estado === 'critico').length);

    const statsCards = computed(() => [
      {
        title: 'Horas Dictadas',
        value: `${totalDictadas.value}h`,
        subtitle: `de ${totalProgramadas.value}h prog.`,
        icon: 'clock',
        tone: 'primary',
      },
      {
        title: 'Cumplimiento',
        value: `${cumplimientoPromedio.value.toFixed(1)}%`,
        subtitle: 'Promedio periodo',
        icon: 'bullseye',
        tone: 'success',
      },
      {
        title: 'Días Completos',
        value: `${diasCompletos.value}/${registroSemanal.value.length}`,
        subtitle: 'Esta semana',
        icon: 'check-circle',
        tone: 'secondary',
      },
      {
        title: 'Cursos en Alerta',
        value: `${cursosConAlerta.value}`,
        subtitle: 'Requieren atención',
        icon: 'exclamation-triangle',
        tone: 'warning',
      },
    ]);

    // --- METHODS ---
    const updateTheme = (e: Event) => {
      currentPalette.value = (e.target as HTMLSelectElement).value;
    };

    const updateType = (e: Event) => {
      chartType.value = (e.target as HTMLSelectElement).value as 'area' | 'line' | 'bar';
    };

    const selectDocente = (d: Docente) => {
      selectedDocente.value = d;
      searchDocente.value = '';
    };

    const prevPeriod = () => {
      currentPeriod.value = 'Enero 2026';
    };
    const nextPeriod = () => {
      currentPeriod.value = 'Marzo 2026';
    };
    const handleExport = () => {
      console.log('Exportar reporte');
    };

    const cumplimientoBarClass = (c: number) => (c >= 100 ? 'tw-bg-green-500' : c >= 90 ? 'tw-bg-blue-500' : 'tw-bg-amber-500');

    const estadoBadgeClass = (e: RegistroDiario['estado']) =>
      ({
        completo: 'badge--ok',
        incompleto: 'badge--warn',
        excedido: 'badge--info',
      }[e]);
    const estadoBadgeLabel = (e: RegistroDiario['estado']) => ({ completo: 'Completo', incompleto: 'Incompleto', excedido: 'Excedido' }[e]);

    const estadoCursoBadgeClass = (e: RegistroCurso['estado']) =>
      ({
        excelente: 'badge--ok',
        bueno: 'badge--info',
        alerta: 'badge--warn',
        critico: 'badge--bad',
      }[e]);
    const estadoCursoBadgeLabel = (e: RegistroCurso['estado']) =>
      ({
        excelente: 'Excelente',
        bueno: 'Bueno',
        alerta: 'Alerta',
        critico: 'Crítico',
      }[e]);

    // 2. RETORNO OBLIGATORIO
    return {
      // Estado
      registroSemanal,
      registroMensual,
      registroPorCurso,
      chartType,
      currentPalette,
      selectedDocente,
      searchDocente,
      vistaActiva,
      currentPeriod,
      // Computados
      filteredDocentes,
      weeklySeries,
      weeklyChartOptions,
      monthlySeries,
      monthlyChartOptions,
      docenteInitials,
      statsCards,
      cursosConAlerta,
      totalDictadas,
      totalProgramadas,
      cumplimientoPromedio,
      // Métodos
      updateTheme,
      updateType,
      selectDocente,
      prevPeriod,
      nextPeriod,
      handleExport,
      cumplimientoBarClass,
      estadoBadgeClass,
      estadoBadgeLabel,
      estadoCursoBadgeClass,
      estadoCursoBadgeLabel,
    };
  },
});
</script>

<style scoped>
/* Header */
.pageHeader {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 16px;
}
.pageHeader__title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}
.pageHeader__subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}
.pageHeader__right {
  display: flex;
  gap: 10px;
  align-items: center;
}
.exportBtn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.pageBody {
  padding: 16px 0 22px;
}

/* Filters card */
.filtersCard {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  margin-bottom: 14px;
}
.filtersGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.filtersGrid--2 {
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .filtersGrid--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: end;
  }
}
.filterItem {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filterLabel {
  font-size: 12px;
  font-weight: 900;
  color: #334155;
}
.filterControl {
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  background: #fff;
  width: 100%;
}
.filterControl:focus {
  border-color: rgba(var(--color-primary-rgb), 0.7);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.14);
}

/* Period */
.periodRow {
  display: grid;
  grid-template-columns: 42px 1fr 42px;
  gap: 10px;
  align-items: center;
}
.periodBtn {
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.periodBtn:hover {
  background: #f8fafc;
}
.periodValue {
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  color: #0f172a;
  font-size: 13px;
}
.periodValue__icon {
  opacity: 0.8;
}

/* Teacher card */
.teacherCard {
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.08), rgba(var(--color-primary-rgb), 0.16));
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}
.teacherCard__avatar {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}
.teacherCard__name {
  font-weight: 900;
  color: #0f172a;
}
.teacherCard__meta {
  font-size: 13px;
  color: #475569;
  font-weight: 700;
}

/* Dashboard cards (igual a tu estilo) */
.cards-dashboard-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 16px;
}
@media (min-width: 768px) {
  .cards-dashboard-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }
}
.container-custom-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}
.dashCard__title {
  font-size: 13px;
  font-weight: 900;
  color: #334155;
}
.dashCard__body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}
.dashCard__value {
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
}
.dashCard__subtitle {
  margin: 8px 0 0;
  font-size: 13px;
  color: #64748b;
}
.dashCard__iconBox {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dashCard__icon {
  font-size: 18px;
}

/* tones */
.dashCard__iconBox--primary {
  background: rgba(var(--color-primary-rgb), 0.12);
}
.dashCard__icon--primary {
  color: var(--color-primary);
}
.dashCard__iconBox--success {
  background: rgba(34, 197, 94, 0.14);
}
.dashCard__icon--success {
  color: #16a34a;
}
.dashCard__iconBox--warning {
  background: rgba(245, 158, 11, 0.16);
}
.dashCard__icon--warning {
  color: #d97706;
}
.dashCard__iconBox--secondary {
  background: rgba(var(--color-secondary-rgb), 0.14);
}
.dashCard__icon--secondary {
  color: var(--color-secondary);
}

/* Alert card */
.alertCard {
  border: 1px solid #fde68a;
  background: #fffbeb;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}
.alertCard__icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.18);
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.alertCard__title {
  font-weight: 900;
  color: #78350f;
  margin-bottom: 4px;
}
.alertCard__list {
  margin: 0;
  padding-left: 14px;
  color: #92400e;
  font-weight: 600;
  font-size: 13px;
}

/* Tabs */
.tabsCard {
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
}
.tabsHead {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid #e2e8f0;
}
.tabBtn {
  padding: 12px 10px;
  font-size: 13px;
  font-weight: 900;
  color: #475569;
  background: #fff;
  border: 0;
  border-bottom: 2px solid transparent;
}
.tabBtn:hover {
  background: #f8fafc;
}
.tabBtn--active {
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
.tabsBody {
  padding: 14px;
}

/* Titles / placeholders */
.sectionTitle {
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 10px;
  font-size: 14px;
}
.chartPlaceholder {
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  overflow: hidden;
}
.chartPlaceholder__head {
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  background: #f8fafc;
  color: #334155;
  font-weight: 800;
  font-size: 13px;
}
.chartPlaceholder__box {
  height: 280px;
  background: #fff;
}

/* Table */
.tableCard {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}
.tableHead {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}
.tableHead__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
  color: #0f172a;
}
.th {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 900;
}
.td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid transparent;
}
.badge--ok {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.badge--warn {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}
.badge--info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.badge--bad {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

/* Empty state */
.emptyState {
  padding: 40px 0;
  text-align: center;
}
.emptyState__icon {
  font-size: 28px;
  opacity: 0.7;
}
.emptyState__title {
  margin-top: 10px;
  font-weight: 900;
  color: #334155;
}
.emptyState__desc {
  margin-top: 6px;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
}

/* Week cards */
.weekCard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
}
.weekCard__k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.weekCard__v {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
  margin-top: 6px;
}
.weekCard__sub {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-top: 4px;
}

/* Summary */
.summaryCard {
  margin-top: 14px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  background: rgba(var(--color-primary-rgb), 0.08);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  gap: 12px;
}
.summaryCard__icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(var(--color-primary-rgb), 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}
.summaryCard__title {
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 10px;
}
.summaryGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 768px) {
  .summaryGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
}
.summaryK {
  font-size: 12px;
  font-weight: 900;
  color: #334155;
}
.summaryV {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}

/* PrimeVue tweaks */
.payslipsTable :deep(.p-datatable-table) {
  width: 100%;
}
.payslipsTable :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}
.payslipsTable :deep(.p-paginator) {
  border-top: 1px solid #e2e8f0;
}
.container-graph {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  margin-bottom: 18px;
}

.content-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 10px;
}

.controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.controls select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

::v-deep(.apexcharts-toolbar) {
  z-index: 5 !important;
}
</style>
