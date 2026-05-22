<template>
  <AppBaseList :title="title">
    <template #content>
      <SelectionStudentsByParent @update-student-user-id="updateStudentUserId"></SelectionStudentsByParent>
      <AppLoading v-if="loading" />

      <template v-else>
        <!-- GRID PRINCIPAL: métricas, gráfica y tarjeta -->
        <!-- FLEX PRINCIPAL -->
        <AppEmptyResponse v-if="!dashboard.value" :show-image="true"></AppEmptyResponse>
        <template v-else>
          <div class="dashboard-layout">
            <!-- IZQUIERDA: cards + gráfica -->
            <div class="dashboard-left">
              <div class="container-content d-flex flex-column gap-3">
                <div class="container-cards">
                  <AppCardWithTriangular icon="graphUp">
                    <template #title>{{ t('classroom.overallAverage.title') }}</template>
                    <template #body>
                      <div class="card-graph">
                        <h3>{{ dashboard.value?.periodNote }}</h3>
                      </div>
                    </template>
                  </AppCardWithTriangular>

                  <AppCardWithTriangular icon="calendarCheckFill">
                    <template #title>{{ t('reports.filters.unattendances') }}</template>
                    <template #body>
                      <div class="card-graph">
                        <h3>{{ dashboard.value?.cantAbsences }}</h3>
                      </div>
                    </template>
                  </AppCardWithTriangular>
                </div>
              </div>
              <div class="container-graph">
                <chart class="w-100" typeGraph="line" :dataDashboard="dataGraphStudent" :dataOptions="dataGraphOptionsStudent">
                  <!-- slot content-header ahora DENTRO del componente chart -->
                  <template #content-header>
                    <h4 class="title-graph">
                      {{ t('administration.dashboard.grahp') }}
                    </h4>
                  </template>
                </chart>
              </div>
            </div>

            <div class="dashboard-right" @click="$router.push({ name: 'access.profile' })">
              <div class="container-form-nav">
                <div v-if="dashboard.value.student" class="content-form-info-nav">
                  <div v-if="dashboard.value.student" class="contetn-avatar-form-nav">
                    <div class="avatar-form-nav avatar-shadow">
                      <AppAvatar class="avatar-nav" :size="'lg'" :avatar="dashboard.value?.student?.avatar ?? null" :name="dashboard.value?.student?.userNames ?? null" />
                    </div>
                  </div>

                  <div class="personal-info-nav" style="text-align: center">
                    <div class="text-title-form-nav">
                      {{ dashboard.value?.student?.userNames }}
                    </div>
                    <div class="student-info-nav">
                      <span>
                        <span>{{ t('core.generalTerms.academic.student.singular') }}</span>
                        -
                        {{ dashboard.value?.student?.studentCode || '' }}
                      </span>
                      <span class="state-tag" :class="dashboard.value?.student?.userInstitutionIsActive === 1 ? 'state-active' : 'state-inactive'">
                        {{ dashboard.value?.student?.userInstitutionIsActive === 1 ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                  </div>

                  <div class="academy-info-nav">
                    <div class="academy-info-item">
                      <span class="text-title-form-nav">
                        {{ dashboard.value?.student?.academicPeriodName }}
                      </span>
                      <span>{{ t('academicPlanning.academicPeriods.singular') }}</span>
                    </div>
                    <div class="academy-info-item">
                      <span class="text-title-form-nav">
                        {{
                          `${dashboard.value?.student?.degreeName || ''} ${dashboard.value?.student?.groupAbbreviation || ''}` +
                          ` - ${dashboard.value?.student?.levelName || ''} - ${dashboard.value?.student?.journeyName || ''}`
                        }}
                      </span>
                      <span>{{ t('academicAdministration.courseAdministration.table.course') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CourseSlider :courses="dashboard.value.courses" />
          <div class="d-flex gap-3 align-items-stretch">
            <!-- ——— Horario de hoy ——— -->
            <div class="schedule-timeline">
              <h4 class="title-graph">{{ t('core.menu.studentSchedule') }} {{ today }}</h4>

              <AppEmptyResponse :title="'No cuenta con un horario asignado'" :showImage="true" v-if="!subjectsToday.length" :size="'sm'" :subtitle="false"></AppEmptyResponse>
              <div v-else class="timeline">
                <div v-for="(subj, idx) in subjectsToday" :key="subj.id" class="timeline-item">
                  <!-- El círculo -->
                  <div class="timeline-icon" :style="{ backgroundColor: getColor(idx, subj.color) }"></div>

                  <!-- La línea que conecta, excepto en el último -->
                  <div v-if="idx < subjectsToday.length - 1" class="timeline-line"></div>

                  <!-- Contenido de cada paso -->
                  <div class="timeline-content">
                    <div>
                      <strong>{{ subj.courseName }}</strong>
                      {{ t('core.generalTerms.academic.teacher.singular') }}:
                      {{ subj.teacherName }}
                    </div>
                    <small>{{ formatTime(subj.startTime) }} – {{ formatTime(subj.endTime) }}</small>
                  </div>
                </div>
              </div>

              <!-- —— Aquí va el “Ver todo” —— -->
              <div v-if="subjectsToday.length" class="view-all text-end">
                <!-- opción A: con router-link -->

                <AppCheckPermission permission="classroomAdministration.studentSchedule.list">
                  <router-link
                    :to="{
                      name: 'administration.studentSchedule',
                      params: {},
                    }"
                    >Ver todo</router-link
                  >
                </AppCheckPermission>
              </div>
            </div>
          </div>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../../stores/user';
import { useHeaderStore } from '../../../stores/header.store';
//import 'vue3-carousel/dist/carousel.css';
import dayjs from 'dayjs';
dayjs.locale('es');

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppCardWithTriangular from '../../../shared/components/Card/AppCardWithTriangular.vue';
import chart from '../../../shared/components/Card/chart.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import { GetDasboardStudent } from '../services/getDasboardStudent.service';
import CourseSlider from '../components/CourseSlider.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import SelectionStudentsByParent from '../components/SelectionStudentsByParent.vue';

const getDasboardStudent = new GetDasboardStudent();

export default defineComponent({
  components: {
    AppBaseList,
    AppCheckPermission,
    AppLoading,
    chart,
    AppCardWithTriangular,
    AppAvatar,
    CourseSlider,
    AppEmptyResponse,
    SelectionStudentsByParent,
  },
  name: 'administration.studentSchedule.dashboard',
  setup() {
    const userStorage = useUserStore();

    const loading = ref(true);
    const title = 'administration.studentSchedule.dashboard';
    const { t } = useI18n();

    const dashboard: { value: any } = reactive({
      value: {},
    });
    const dataGraphStudent = ref<any[]>([]);
    const dataGraphOptionsStudent = ref({});

    const today = computed(
      () => dayjs().format('dddd') // sólo el nombre del día, ej. “martes”
      // o para fecha completa: dayjs().format('DD [de] MMMM YYYY')
    );
    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log('error', e);
      }
    });
    const updateStudentUserId = async (studentUserId: any) => {
      loading.value = true;

      if (studentUserId) {
        const params = { userId: studentUserId as number };
        dashboard.value = await getDasboardStudent.run(params);
        await getDasboard();
        loading.value = false;
      } else {
        // notificationsNotOpen.value = await getNotificationsNotOpenService.run();
        dashboard.value = await getDasboardStudent.run();
        loading.value = false;
      }
      loading.value = false;
    };
    // DASHBOARD
    const getDasboard = async () => {
      // 0) Parámetros y llamada al servicio
      // dashboard.value = await getDasboardStudent.run();

      // 1) Lista única de materias
      const dataSubjects: any[] = [];
      dashboard.value.notesByPeriod.forEach((period: any) =>
        period.subjects.forEach((sub: any) => {
          if (!dataSubjects.find((x) => x.subjectId === sub.subjectId)) {
            dataSubjects.push(sub);
          }
        })
      );

      // 2) Extraer y ordenar todos los valores numéricos únicos de periodNote
      const uniqueNums = Array.from(new Set(dashboard.value.notesByPeriod.flatMap((period: any) => period.subjects.map((sub: any) => sub.periodNote)))).sort((a, b) => a - b);

      // 3) Map numérico → etiqueta (cualitativa si existe, si no el número como string)
      const noteLabels: Record<number, string> = {};
      uniqueNums.forEach((num: any) => {
        const subjWithQual = dashboard.value.notesByPeriod.flatMap((period: any) => period.subjects).find((s: any) => s.periodNote === num && s.qualitativePeriodNote != null);
        noteLabels[num] = subjWithQual ? subjWithQual.qualitativePeriodNote! : num.toString();
      });

      // 4) Construir el array de categorías para el eje Y
      const categories = uniqueNums.map((num: any) => noteLabels[num]);

      // 5) Índice etiqueta → posición en el array categories
      const labelIndex: Record<string, number> = {};
      categories.forEach((lab, i) => {
        labelIndex[lab] = i;
      });

      // 6) Generar las series usando ese índice
      dataGraphStudent.value = dashboard.value.notesByPeriod.map((period: any) => ({
        name: period.periodName,
        data: dataSubjects.map((subj) => {
          const hit = period.subjects.find((s: any) => s.subjectId === subj.subjectId);
          if (!hit) return null;
          const label = hit.qualitativePeriodNote != null ? hit.qualitativePeriodNote : hit.periodNote.toString();
          return labelIndex[label];
        }),
      }));

      // 7) Opciones del gráfico con el eje Y personalizado
      dataGraphOptionsStudent.value = {
        dataLabels: {
          enabled: true,
          formatter: (val: any) => categories[val] ?? '',
        },
        stroke: {
          curve: 'straight',
          width: Array(dashboard.value.notesByPeriod.length).fill(3),
          dashArray: Array(dashboard.value.notesByPeriod.length).fill(0),
        },
        markers: { size: 5, hover: { sizeOffset: 3 } },
        xaxis: {
          categories: dataSubjects.map((s: any) => s.subjectShortName?.split('-')[0] || s.subjectName?.split('-'[0]) || ''),
          labels: { rotate: -60, style: { fontSize: '10px' } },
        },
        yaxis: {
          min: 0,
          max: categories.length - 1,
          tickAmount: categories.length - 1,
          forceNiceScale: false,
          decimalsInFloat: 0,
          labels: {
            formatter: (val: number) => categories[val] ?? '',
          },
        },
        legend: {
          show: true,
          position: 'bottom',
          horizontalAlign: 'center',
          formatter: (_: string, opts: any) => dataGraphStudent.value[opts.seriesIndex].name,
        },
        theme: { palette: 'palette8' },
        chart: {
          type: 'area',
          height: 350,
          zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
            autoSelected: 'zoom',
          },
        },
      };
    };

    // HORARIO
    // Paleta de colores por defecto
    const defaultColors = ['#F29905', '#E53935', '#FDD835', '#8BC34A', '#00BCD4', '#673AB7'];

    // Lista de materias de hoy
    const subjectsToday = computed(() => dashboard.value?.timetables?.subjects ?? []);

    // Helper para formatear hora
    const formatTime = (t: string) => dayjs(t, 'HH:mm:ss').format('hh:mm A');
    const getColor = (idx: number, subjColor: string | null) => subjColor || defaultColors[idx % defaultColors.length];

    return {
      loading,
      t,
      dayjs,
      title,
      dashboard,
      dataGraphStudent,
      dataGraphOptionsStudent,
      getDasboard,

      subjectsToday,
      formatTime,
      getColor,
      // selector padre familia
      updateStudentUserId,
      // images,
      userStorage,
      today,
    };
  },
});
</script>
<style scoped>
/* ——— GRID PRINCIPAL ——— */
.dashboard-layout {
  display: flex;
  gap: 1rem;
  width: 100%;
  align-items: stretch;
}
.dashboard-left {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.dashboard-right {
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

/* ——— TÍTULOS ——— */
.title-graph {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  font-weight: 800;
  color: black;
}

/* ——— MÉTRICAS ——— */
.container-cards {
  margin-bottom: 5px;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

/* ——— GRÁFICO ——— */
.container-graph {
  flex: 1;
  display: flex;
  justify-content: center;
}

/* ——— CARRUSEL (si existiera) ——— */
.carousel {
  width: 500px;
  border-radius: 16px;
  background: #fff;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* ---------------- TARJETA DE ESTUDIANTE ---------------- */
/* ——— CENTRAR TODO EL CONTENIDO EN LA TARJETA ---------------- */
.container-form-nav {
  flex: 1; /* ocupa toda la altura de .dashboard-right */
  display: flex; /* convierto en flexbox */
  flex-direction: column;
  justify-content: center; /* centra verticalmente */
  align-items: center; /* centra horizontalmente */
  background-color: var(--color-primary);
  padding: 10px;
  border-radius: 16px;
  color: #fff;
  position: relative;
}

/* hacemos transparente el wrapper interno */
.content-form-nav {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}

/* ——— AVATAR ——— */
.contetn-avatar-form-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-form-nav {
  width: 120px;
  height: 120px;
  border: 5px solid #fff;
  border-radius: 50%;
  overflow: hidden;
  background-color: #fff;
}
.avatar-shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
.avatar-nav {
  width: 120px;
  height: 120px;
}

/* ——— INFO PERSONAL ——— */
.personal-info-nav .text-title-form-nav {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-bottom: 0.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.student-info-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
}
.state-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  border: 2px solid #fff;
  letter-spacing: 0.3px;
}
.state-active {
  background-color: #00b74a;
}
.state-inactive {
  background-color: #9b9b9b;
}

/* ——— ACADEMIA ——— */
.academy-info-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.academy-info-item {
  display: flex;
  flex-direction: column;
  text-align: center;
}
.academy-info-item .text-title-form-nav {
  font-size: 1.25rem;
  font-weight: 700;
}
.academy-info-item span:last-child {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
}
.academy-info-nav hr {
  width: 40px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  margin: 0;
}
.student-info-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
}
.state-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  border: 2px solid #fff;
  letter-spacing: 0.3px;
}
.state-active {
  background-color: #00b74a;
}
.state-inactive {
  background-color: #9b9b9b;
}
.academy-info-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.academy-info-item {
  display: flex;
  flex-direction: column;
}
.academy-info-item .text-title-form-nav {
  font-size: 1.25rem;
  font-weight: 700;
}
.academy-info-item span:last-child {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
}
.academy-info-nav hr {
  width: 40px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  margin: 0;
}
.avatar-nav {
  width: 120px;
  height: 120px;
}

/* ——— RESPONSIVE ——— */
@media (max-width: 600px) {
  .contentSpan {
    display: flex;
    flex-direction: column;
  }
  .observation-card-custom {
    display: flex;
    flex-direction: column;
  }
  .teacher-row {
    width: 100%;
  }
}
@media (max-width: 900px) {
  /* .contentSpan{
    display: flex;
    flex-direction: column;
  } */
  .observation-card-custom {
    flex-direction: column; /* apilar en móviles */
  }
  .observation-card-custom .level-offense {
    order: -1; /* sigue primero, ahora arriba */
    min-width: 100%;
    border-bottom: 1px solid #e5e7eb;
  }
  .contentRow {
    flex-direction: column;
    align-items: flex-start;
  }
  .dashboard-layout {
    flex-direction: column;
  }
  .dashboard-right {
    order: 0;
    flex: 0 0 auto;
    width: 100%;
    margin-bottom: 1rem;
  }
  .dashboard-left {
    order: 1;
    width: 100%;
  }
  .align-items-stretch {
    flex-direction: column;
  }
  .contentControlDisciplinary {
    display: flex;
    flex-direction: column;
  }
}

/* ——— OBSERVACIONES ——— */
.observationContent-card-custom {
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0 12px 24px -4px rgba(145, 158, 171, 0.12), 0 0 2px 0 rgba(145, 158, 171, 0.2);
  border-radius: 16px;
  padding: 1rem;
  gap: 10px;
  flex: 1;
}
.observation-card-custom {
  background: #fff;
  border-radius: 8px;
  box-shadow: -2px 5px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
  overflow: hidden;
  border: 1px solid #ccc;
  display: flex;
  align-items: stretch; /* que el nivel estire a la altura del contenido */
}
.observation-card-custom .level-offense {
  background: #9ede94;
  min-width: 150px;
  padding: 10px;
  order: -1; /* <— mueve el nivel al inicio */
  align-self: stretch; /* ocupa toda la altura */
  display: flex; /* asegura centrado vertical/horizontal */
}
/* empuja “Ver todo” abajo y a la derecha */
.observationContent-card-custom .view-all {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

/* ——— HORARIO DE HOY ——— */
/* ——— Asegura que el wrapper estire a la altura completa ——— */
.d-flex.align-items-stretch {
  height: 100%;
}
.schedule-timeline {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0 12px 24px -4px rgba(145, 158, 171, 0.12), 0 0 2px 0 rgba(145, 158, 171, 0.2);
  border-radius: 16px;
  padding: 1rem;
  gap: 10px;
}
/* ——— Empuja “Ver todo” al fondo ——— */
.schedule-timeline .view-all {
  margin-top: auto; /* empuja hacia abajo */
  align-self: flex-end; /* alinea a la derecha */
  /* si quieres un pequeño espacio desde el borde: */
  /* margin-bottom: 0.5rem; */
}
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
}
.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-left: 2rem;
  margin-bottom: 1.25rem;
}
.timeline-icon {
  position: absolute;
  left: 0;
  top: 0.25rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
}
.timeline-line {
  position: absolute;
  left: 6px;
  top: 1.25rem;
  width: 2px;
  height: calc(100% - 1.25rem);
  background-color: #ccc;
}
.timeline-content {
  margin-left: 0.5rem;
  line-height: 1.3;
}
.timeline-content small {
  color: #666;
}
/* empuja “Ver todo” abajo y alinea al borde derecho */
.schedule-timeline .view-all {
  margin-top: auto;
  align-self: flex-end;
}

/* ——— ENLACES “Ver todo” ——— */
.view-all {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9rem;
  color: var(--bs-primary);
}
.view-all:hover {
  text-decoration: underline;
}
.label {
  font-weight: 600;
  color: #374151;
  margin-right: 0.5rem;
}
.value {
  color: #6b7280;
}
.content-form-info-nav {
  display: flex;
  flex-direction: column;
}
.contentControlDisciplinary {
  display: flex;
}
/* Fila superior (avatar + nombre + fecha separados) */
.contentRow {
  display: flex;
  gap: 0.75rem;
}
/* Avatar + texto en la misma altura, sin “saltos” */
.teacher-row {
  display: flex;
  align-items: flex-start; /* <— alinea verticalmente avatar y nombre */
  gap: 0.75rem;
  min-width: 0; /* mejor truncamiento en pantallas pequeñas */
}

.avatar-cell {
  flex: 0 0 auto;
}

.teacher-text {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  flex-wrap: wrap;
}
</style>
