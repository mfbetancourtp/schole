<template>
  <AppBaseList>
    <template #content>
      <SelectionStudentsByParent @update-student-user-id="updateStudentUserId" />

      <AppLoading v-if="loading" />

      <template v-else-if="!periods.length || !data.length">
        <AppEmptyResponse :subtitle="false" :showImage="true" />
      </template>

      <template v-else>
        <div class="dashboard-layout">
          <!-- dashboard izquierdo -->
          <div class="dashboard-left">
            <div class="contentPeriod">
              <h4 class="title-graph">
                {{ t('administration.grades.average') }}
              </h4>
              <div class="container-cards">
                <AppCardWithTriangular class="p-3" v-for="period in periods" :key="period.id" icon="graphUp">
                  <template #title>{{ period.name }}</template>
                  <template #body>
                    <div class="card-graph">
                      <h3>{{ period.average }}</h3>
                    </div>
                  </template>
                </AppCardWithTriangular>
              </div>
            </div>
          </div>

          <!-- dashboard derecho -->
          <div class="dashboard-right">
            <Chart class="chart-full" typeGraph="area" :dataDashboard="dataGraphStudent" :dataOptions="dataGraphOptionsStudent">
              <template #content-header>
                <h4 class="title-graph">
                  {{ t('administration.dashboard.grahp') }}
                </h4>
              </template>
            </Chart>
          </div>
        </div>

        <!-- tabla AppDatatable -->
        <AppDatatable :tableTitle="t('administration.grades.qualification')" :data="data" :paginated="false" :enable-search-filter="false" :show-filter-steps="false">
          <template v-if="countLearningOutcomes" #additionalContent>
            <StudentAcademicReportDownload :matriculateId="matriculateId" />
          </template>

          <!-- columnas -->
          <AppDatatableColumn :label="t('core.generalTerms.academic.teacher.singular')" field="student" :sortable="true" v-slot="{ row }" :sticky="true" :width="'280px'">
            <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
              <AppAvatar :size="'sm'" :avatar="row.teacher?.avatar" :name="row.teacher?.names || '?'"></AppAvatar>
              <div class="tw-min-w-0 tw-ml-4">
                <div class="tw-font-medium tw-leading-5 tw-truncate">
                  {{ row.teacher?.names }}
                </div>
                <div class="tw-leading-5 tw-truncate tw-font-light">
                  {{ row.teacher?.lastnames }}
                </div>
              </div>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn :label="t('core.generalTerms.academic.subject.singular')" field="subject.name" :sticky="true" :width="'220px'" class="subject-column">
            <template #default="{ row }">
              <!-- Contenido para escritorio -->
              <div class="subject-desktop">{{ row.subject.name }}</div>
              <!-- Contenido para móvil - se mostrará en una fila separada -->
              <div class="subject-mobile">
                <div class="subject-mobile-label text-light">{{ t('core.generalTerms.academic.subject.singular') }}:</div>
                <div class="subject-mobile-value">{{ row.subject.name }}</div>
              </div>
            </template>
          </AppDatatableColumn>

          <AppDatatableColumn
            v-for="period in periods"
            :key="period.id"
            :label="period.name"
            :field="`period_${period.id}`"
            :sortable="false"
            :searchable="false"
            class="text-center border-end"
            position="centered"
            :width="'15rem'"
          >
            <template #default="{ row }">
              <div v-if="countLearningOutcomes" class="mini-columns">
                <div class="mini-headers">
                  <template v-for="index in countLearningOutcomes" :key="`header-${index}`">
                    <template v-if="row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.activityPeriodId">
                      <div class="mini-column mini-header" v-tooltip="'Desempeño ' + index">D{{ index }}</div>
                    </template>
                    <template v-else>
                      <div class="mini-column mini-header"></div>
                    </template>
                  </template>

                  <div class="mini-column mini-header" v-tooltip="'Nota final'">FN</div>
                </div>

                <!-- Estructura para escritorio - Valores -->
                <div class="mini-values">
                  <template v-for="index in countLearningOutcomes" :key="`value-${index}`">
                    <template v-if="row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.activityPeriodId">
                      <div class="mini-column mini-value" v-tooltip="getTooltipDescription(row, period.id, index - 1)">
                        <template
                          v-if="
                            row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.finalScore ||
                            row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.finalScoreForCalculation
                          "
                        >
                          <template v-if="rantinScales.length">
                            {{
                              row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.finalScore ??
                              row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.finalScoreForCalculation ??
                              ''
                            }}
                          </template>
                          <template v-else>
                            {{ row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.finalScoreForCalculation ?? '' }}
                          </template>
                        </template>
                        <template v-else>
                          <span class="text-muted">-</span>
                        </template>
                      </div>
                    </template>
                    <template v-else>
                      <div class="mini-column mini-header"></div>
                    </template>
                  </template>

                  <!-- Final grade value -->
                  <div class="mini-column mini-value">
                    <AppCheckPermission permission="classroom.activitiesStudent.list" notSee>
                      <router-link
                        :to="{
                          name: 'administration.studentActivities',
                          query: {
                            courseId: row.courseId,
                            academicPeriodGroupId: row.periodId,
                          },
                        }"
                        replace
                        @click="
                          selectTabsStore(
                            'activities',
                            {
                              courseId: row.courseId,
                              academicPeriodGroupId: period.id,
                            },
                            'administration.studentActivities'
                          )
                        "
                        class="hover-link"
                      >
                        <div class="hover-content">
                          <span class="hover-text">
                            <template v-if="isQualitativeGrading">
                              {{ row.periods.find((p: any) => p.id === period.id)?.matriculateSubjectPeriod.finalPeriodConvert?.qualitativeQualificationAbbreviation ?? '' }}
                            </template>
                            <template v-else>
                              {{ row.periods.find((p: any) => p.id === period.id)?.matriculateSubjectPeriod?.finalPeriod ?? '-' }}
                            </template>
                          </span>

                          <AppIcon icon="search" class="hover-icon" v-tooltip="'ver detalle'" />
                        </div>
                      </router-link>
                    </AppCheckPermission>
                  </div>
                </div>

                <!-- Estructura para móvil - Filas individuales (se muestran automáticamente en mobile) -->
                <template v-for="index in countLearningOutcomes" :key="`mobile-${index}`">
                  <div v-if="row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.activityPeriodId" class="row-item">
                    <div class="mini-label">D{{ index }}</div>

                    <div class="mini-value">
                      <template v-if="row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.finalScore">
                        {{ row.periods.find((p: any) => p.id === period.id)?.learningOutcomes[index - 1]?.finalScore ?? '' }}
                      </template>

                      <template v-else>
                        <span class="text-muted">-</span>
                      </template>
                    </div>
                  </div>
                </template>

                <!-- Final grade para móvil -->
                <div class="row-item">
                  <div class="mini-label">FN</div>
                  <div class="mini-value">
                    <AppCheckPermission permission="classroom.activitiesStudent.list" notSee>
                      <router-link
                        :to="{
                          name: 'administration.studentActivities',
                          query: {
                            courseId: row.courseId,
                            academicPeriodGroupId: row.periodId,
                          },
                        }"
                        replace
                        @click="
                          selectTabsStore(
                            'activities',
                            {
                              courseId: row.courseId,
                              academicPeriodGroupId: period.id,
                            },
                            'administration.studentActivities'
                          )
                        "
                        class="d-flex justify-content-end align-items-center"
                      >
                        <span>
                          <template v-if="isQualitativeGrading">
                            {{ row.periods.find((p: any) => p.id === period.id)?.matriculateSubjectPeriod.finalPeriodConvert?.qualitativeQualificationAbbreviation ?? '' }}
                          </template>
                          <template v-else>
                            {{ row.periods.find((p: any) => p.id === period.id)?.matriculateSubjectPeriod?.finalPeriod ?? '-' }}
                          </template>
                        </span>
                        <AppButton v-tooltip="'ver detalle'" icon="search" outlined />
                      </router-link>
                    </AppCheckPermission>
                  </div>
                </div>
              </div>

              <div v-else class="d-flex justify-content-center gap-2">
                <template v-if="isQualitativeGrading">
                  {{ row.periods.find((p: any) => p.id === period.id)?.matriculateSubjectPeriod.finalPeriodConvert?.qualitativeQualificationAbbreviation ?? '' }}
                </template>
                <template v-else>
                  {{ row.periods.find((p: any) => p.id === period.id)?.matriculateSubjectPeriod?.finalPeriod ?? '-' }}
                </template>

                <AppCheckPermission permission="classroom.activitiesStudent.list" notSee>
                  <router-link
                    :to="{
                      name: 'administration.studentActivities',
                      query: {
                        courseId: row.courseId,
                        academicPeriodGroupId: row.periodId,
                      },
                    }"
                    replace
                    @click="
                      selectTabsStore(
                        'activities',
                        {
                          courseId: row.courseId,
                          academicPeriodGroupId: period.id,
                        },
                        'administration.studentActivities'
                      )
                    "
                  >
                    <AppButton v-tooltip="'ver detalle'" icon="search" outlined></AppButton>
                  </router-link>
                </AppCheckPermission>
              </div>
            </template>
          </AppDatatableColumn>
        </AppDatatable>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import { useHeaderStore } from '../../../stores/header.store';
import { useInitDataStore } from '../../../stores/initData.store';
import { useTabsStudentStore } from '../../../stores/tabsStudent.store';

import AppIcon from '../../../shared/components/AppIcon.vue';
import Chart from '../../../shared/components/Card/chart.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import SelectionStudentsByParent from '../components/SelectionStudentsByParent.vue';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppCardWithTriangular from '../../../shared/components/Card/AppCardWithTriangular.vue';

import StudentAcademicReportDownload from '../components/StudentAcademicReportDownload.vue';

import { GetDasboardStudent } from '../services/getDasboardStudent.service';
import { GetAdministrationMatriculateSubjectsWithPeriodNoteService } from '../services/getAdministrationMatriculateSubjectsWithPeriodNote.service';

const getAdministrationMatriculateSubjectsWithPeriodNoteService = new GetAdministrationMatriculateSubjectsWithPeriodNoteService();
const updateDatatableService = new UpdateDatatableService();
const getDasboardStudent = new GetDasboardStudent();

export default defineComponent({
  name: 'MyGrades',

  components: {
    Chart,
    AppIcon,
    AppButton,
    AppAvatar,
    AppLoading,
    AppBaseList,
    AppDatatable,
    AppDatatableColumn,
    AppCheckPermission,
    AppCardWithTriangular,
    SelectionStudentsByParent,

    StudentAcademicReportDownload,
  },

  setup() {
    const { t } = useI18n();
    const title = t('administration.homeStudent.qualifications');

    useMeta({ title: title });

    const initStore = useInitDataStore();
    const headerStorage = useHeaderStore();
    const tabsStore = useTabsStudentStore();

    headerStorage.module = { name: 'Salón de clases', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };

    const data: Ref<any[]> = ref([]);
    const periods: Ref<any[]> = ref([]);
    const dataGraphStudent = ref<any[]>([]);
    const rantinScales: Ref<any[]> = ref([]);
    const matriculateId: Ref<number> = ref(0);
    const countLearningOutcomes: Ref<number> = ref(0);
    const dataGraphOptionsStudent = ref<Record<string, any>>({});

    const dashboard: { value: any } = reactive({
      value: {},
    });

    const loading = ref(false);
    const isQualitativeGrading = ref(false);

    onMounted(async () => {
      try {

        updateDatatableService.run();
        
      } catch (e) {
        console.error('error - onMounted: ', e);
      }

      loading.value = false;
    });

    const updateStudentUserId = async (studentUserId: any) => {

      try {
        loading.value = true;
        updateDatatableService.run();
                const matriculateIdParams = initStore.initData?.matriculates?.matriculateId ?? ref(Number(localStorage.getItem('matriculateId') ?? null));
        matriculateId.value = matriculateIdParams;
        console.log('initStore.initData?.matriculates?.matriculateId', initStore.initData?.matriculates?.matriculateId);
        console.log("ref(Number(localStorage.getItem('matriculateId') ?? null))", ref(Number(localStorage.getItem('matriculateId') ?? null)));
        console.log('matriculateId', matriculateId);

        if (studentUserId) {
          // dashboiard
          const params = { userId: studentUserId as number };
          dashboard.value = await getDasboardStudent.run(params);
          await getDasboard();

          // notesperiod
          const paramsPeriodNote = { onlyEvaluated: true };
          const response = await getAdministrationMatriculateSubjectsWithPeriodNoteService.run(matriculateId.value, paramsPeriodNote);
          data.value = response.matriculateSubjects ?? [];
          rantinScales.value = response.ratingScales ?? [];
          isQualitativeGrading.value = !!response.isQualitativeGrading;

          for (const matriculateSubject of data.value) {
            for (const period of matriculateSubject.periods ?? []) {
              if (period.learningOutcomes?.length > countLearningOutcomes.value) {
                countLearningOutcomes.value = period.learningOutcomes?.length;
              }
            }
          }

          const today = new Date();

          periods.value = (response.periods ?? []).filter((period: any) => {
            const startDate = new Date(period.startDate);
            const endDate = new Date(period.endDate);
            return endDate < today || (startDate <= today && endDate >= today);
          });
        } else {
        const matriculateIdParams = initStore.initData?.matriculates?.matriculateId ?? ref(Number(localStorage.getItem('matriculateId') ?? null));
        matriculateId.value = matriculateIdParams;
        console.log('initStore.initData?.matriculates?.matriculateId', initStore.initData?.matriculates?.matriculateId);
        console.log("ref(Number(localStorage.getItem('matriculateId') ?? null))", ref(Number(localStorage.getItem('matriculateId') ?? null)));
        console.log('matriculateId', matriculateId);
          dashboard.value = await getDasboardStudent.run();
          const response = await getAdministrationMatriculateSubjectsWithPeriodNoteService.run(matriculateId.value);
          data.value = response.matriculateSubjects ?? [];

          const today = new Date();

          periods.value = (response.periods ?? []).filter((period: any) => {
            const startDate = new Date(period.startDate);
            const endDate = new Date(period.endDate);
            return endDate < today || (startDate <= today && endDate >= today);
          });
        }

        loading.value = false;
      } catch (e) {
        console.error('error - updateStudentUserId: ', e);
      }
    };

    const getDasboard = async () => {
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
          categories: dataSubjects.map((s: any) => (s.subjectShortName ? s.subjectShortName.split('-')[0] : '')),
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
          },
          autoSelected: 'zoom',
        },
      };
    };

    const selectTabsStore = (selectTabs: string, params: any, router: string) => {
      (tabsStore.activities = {
        active: selectTabs === 'activities',
        params: params,
        router: (router = 'administration.studentActivities'),
        returnTo: (router = 'gradesStudent'),
      }),
        (tabsStore.atendence = {
          active: selectTabs === 'atendence',
          params: params,
          router: (router = 'administration.studentAttendance'),
          returnTo: (router = 'gradesStudent'),
        });
    };

    const getTooltipDescription = (row: any, periodId: number, learningOutcomeIndex: number) => {
      try {
        const period = row.periods.find((p: any) => p.id === periodId);
        const learningOutcome = period?.learningOutcomes?.[learningOutcomeIndex];
        const finalScore = learningOutcome?.finalScore;

        if (!finalScore || !rantinScales.value?.length) {
          return '';
        }

        const scale = rantinScales.value.find((scale: any) => scale.abbreviation === finalScore);
        return scale?.description || `Calificación: ${finalScore}`;
      } catch (error) {
        console.error('error - getTooltipDescription: ', error);
      }
    };

    return {
      t,

      loading,
      isQualitativeGrading,

      data,
      periods,
      rantinScales,
      matriculateId,
      dataGraphStudent,
      countLearningOutcomes,
      dataGraphOptionsStudent,

      selectTabsStore,
      updateStudentUserId,
      getTooltipDescription,
    };
  },
});
</script>

<style scoped>
table.custom-table {
  width: 100%;
  border-collapse: collapse;
}

table.custom-table th,
table.custom-table td {
  padding: 0.3rem;
  border: 1px solid #ccc;
}

table.custom-table th {
  background-color: #f0f0f0;
  font-weight: bold;
}

table.custom-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

input[type='number'] {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  max-width: 3.5rem;
}
.dashboard-layout {
  display: flex;
  gap: 1rem;
  align-items: stretch; /* empuja a igual altura */
  margin-bottom: 1rem;
}

/* Ambos paneles toman el mismo ancho */

.dashboard-right {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
}
.dashboard-left {
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
}
/* Ajusta padding si lo necesitas */

/* Grid responsivo para las cards */
.container-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  /* que llene todo el alto disponible menos el título */
  flex: 1 1 0;
}

/* Para que el chart también llene todo el alto */
.chart-full {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ec;
}
.contentPeriod {
  background: #ffffff;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  gap: 10px;
  border: 1px solid #e4e7ec;
}
/* ——— TÍTULOS ——— */
.title-graph {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 800;
  color: black;
}

/* Estilos para escritorio - tabla horizontal */
.mini-columns {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

/* Contenedor para los headers (D1, D2, etc.) */
.mini-headers {
  display: flex;
}

/* Contenedor para los valores */
.mini-values {
  display: flex;
}

/* Cada columna individual */
.mini-column {
  flex: 1;
  text-align: center;
  padding: 0.5rem 0.25rem;
  border-right: 1px solid #e4e7ec;
  min-width: 40px;
}

.mini-column:last-child {
  border-right: none;
}

/* Estilo para los headers */
.mini-header {
  font-weight: bold;
  font-size: 0.875rem;
}

/* Ocultar filas móviles en desktop por defecto */
.row-item {
  display: none;
}

/* Ocultar información de asignatura móvil en escritorio */
.subject-mobile-info {
  display: none;
}

/* Mostrar contenido de escritorio de asignatura */
.subject-desktop {
  display: block;
}

/* Estilo para los valores */
.mini-value {
  font-weight: bold;
  font-size: 0.875rem;
}

/* Estilo para los valores */
.mini-value {
  font-size: 0.875rem;
  color: #111827;
}

/* Ocultar filas móviles en desktop por defecto */
.row-item {
  display: none;
}

:deep(.o-table__th span) {
  font-weight: 900 !important;
  /* background-color: red; */
}

/* Estilos para el hover en escritorio */
.mini-value .hover-link {
  position: relative;
  transition: all 0.2s ease;
}

.hover-icon {
  display: none;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.2s ease;
  font-size: 0.875rem;
}
.hover-text {
  opacity: 1;
  transition: all 0.2s ease;
}
.hover-link:hover .hover-icon {
  display: inline;
  opacity: 1;
  transform: translateX(0);
}
.hover-link:hover .hover-text {
  display: none;
  opacity: 0;
}

/* ===== Sticky primeras columnas ===== */
/* Asegura fondo para evitar transparencias al superponer */
:deep(.o-table th),
:deep(.o-table td) {
  background: #ffffff;
}

/* 1ra columna sticky */
:deep(.o-table th:nth-child(1)),
:deep(.o-table td:nth-child(1)) {
  position: sticky;
  left: 0;
  z-index: 10; /* por encima de celdas normales */
  min-width: 280px;
  width: 280px;
  border-right: 1px solid #e4e7ec;
}

/* 2da columna sticky (después de la primera) */
:deep(.o-table th:nth-child(2)),
:deep(.o-table td:nth-child(2)) {
  position: sticky;
  left: 280px; /* igual al ancho de la 1ra columna */
  z-index: 9;
  min-width: 220px;
  width: 220px;
  border-right: 1px solid #e4e7ec;
}

/* Los encabezados deben estar por encima de las celdas del body */
:deep(.o-table thead th:nth-child(1)) {
  z-index: 12;
}
:deep(.o-table thead th:nth-child(2)) {
  z-index: 11;
}

/* Asegurar que el contenedor de la tabla permita scroll horizontal */
:deep(.o-table__wrapper) {
  overflow-x: auto;
  overflow-y: visible;
}

.subject-mobile {
  display: none;
}

@media (max-width: 768px) {
  /* Desactivar sticky en móviles para evitar solapamientos */
  :deep(.o-table th:nth-child(1)),
  :deep(.o-table td:nth-child(1)),
  :deep(.o-table th:nth-child(2)),
  :deep(.o-table td:nth-child(2)) {
    position: static;
    left: auto;
    z-index: auto;
    min-width: unset;
    width: auto;
    box-shadow: none;
  }

  /* Ocultar la columna de asignatura en móvil */
  :deep(.o-table th.subject-column),
  :deep(.o-table td.subject-column) {
    display: none;
  }

  /* Ocultar contenido de escritorio de asignatura */
  .subject-desktop {
    display: none;
  }

  /* Mostrar información de asignatura en móvil dentro de la primera columna */
  .subject-mobile-info {
    display: block;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .subject-mobile-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    margin-bottom: 0.25rem;
  }

  .subject-mobile-value {
    font-size: 0.875rem;
    color: #111827;
    font-weight: 500;
    line-height: 1.25;
  }

  .subject-mobile-meta {
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .dropdown,
  .popover {
    position: static;
    left: auto;
    z-index: auto;
    min-width: unset;
    width: auto;
    box-shadow: none;
  }

  .subject-mobile {
    display: block;
  }
}

/* ===== Responsive ===== */
@media (max-width: 992px) {
  /* A partir de tablets grandes hacia abajo: dos columnas apiladas si hace falta */
  .dashboard-layout {
    flex-direction: column;
  }

  .dashboard-left,
  .dashboard-right {
    flex: 1 1 auto;
  }

  .dashboard-left {
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 768px) {
  /* En tablets medianas / móviles grandes: grid de cards con 2 columnas */
  .container-cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .title-graph {
    font-size: 1.5rem;
  }

  .mini-columns {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    background-color: transparent;
  }

  /* Ocultar los contenedores de tabla horizontal */
  .mini-headers,
  .mini-values {
    display: none;
  }

  /* Mostrar como filas individuales */
  .row-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .row-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .mini-label {
    font-weight: bold;
    font-size: 0.875rem;
    color: #374151;
    flex: 0 0 auto;
    min-width: 30px;
  }

  .mini-value {
    font-size: 0.875rem;
    color: #111827;
    text-align: right;
    flex: 1;
  }

  .hover-text {
    opacity: 1 !important;
  }

  .hover-icon {
    opacity: 1 !important;
    transform: translateX(0) !important;
  }

  .hover-content {
    justify-content: flex-end;
    gap: 0.5rem;
  }
}

@media (max-width: 576px) {
  /* En móviles: grid de cards a 1 columna, texto más pequeño */
  .container-cards {
    grid-template-columns: 1fr;
  }

  .title-graph {
    font-size: 1.25rem;
  }

  .chart-full {
    /* Evitamos que el gráfico crezca demasiado en alto */
    height: auto !important;
  }

  .mini-columns {
    gap: 0.125rem;
  }

  .row-item {
    padding: 0.25rem 0.375rem;
    font-size: 0.8125rem;
  }

  .mini-label,
  .mini-value {
    font-size: 0.8125rem;
  }
}
</style>
