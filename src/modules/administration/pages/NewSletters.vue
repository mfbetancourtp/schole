<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack :to="routes[routes.length - 2].url"></AppButtonBack>
    </template>

    <template v-slot:content>
      <TabsTeacher></TabsTeacher>

      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="container-tables">
          <div class="mb-4 d-flex flex-wrap align-items-center">
            <!-- Título centrado -->
            <h3 class="fw-bold bg-white px-3 py-1" style="color: var(--color-primary)">Gestión Académica: Notas y Observaciones Finales</h3>
            <div class="tw-flex tw-justify-end ms-auto">
              <div class="mb-3 tw-w-full md:tw-w-72">
                <label>{{ t('academicPlanning.periods.name') }}</label>
                <AppAutocomplete v-model="periodId" :options="periods" :label="'name'" :clearable="false" class="bg-white"> </AppAutocomplete>
              </div>
            </div>
          </div>

          <AppLoading v-if="loadingTable"></AppLoading>

          <div v-else class="shadow-sm bg-card bg-white table-responsive" style="overflow-x: auto">
            <AppDatatable :name="title" :data="consolidatedData">
              <AppDatatableColumn label="ESTUDIANTE" :sortable="true" v-slot="{ row }"> {{ row[0] }} y period: {{ periodId }} </AppDatatableColumn>

              <template v-if="periodId != 'null'">
                <AppDatatableColumn label="NOTA FINAL" :sortable="true" v-slot="{ row }" :position="'centered'">
                  <div v-if="isQualitativeGradingId === 1" class="text-center">
                    {{ ratingScalesList.find((item: any) => row[2] >= item.minimumValue && row[2] <= item.maximumValue)?.description || '-' }}
                  </div>
                  <div
                    v-else
                    class="text-center"
                    :style="{
                      backgroundColor: row[3] === 1 ? '#ffaa' : '',
                    }"
                  >
                    {{ row[2] || '-' }}
                  </div>
                </AppDatatableColumn>
              </template>

              <AppDatatableColumn label="OBSERVACIONES DOCENTE" :sortable="true" v-slot="{ row }">
                <div class="ck-content" v-html="row[4]"></div>
              </AppDatatableColumn>

              <AppDatatableColumn label="OPCIONES" :sortable="true" v-slot="{ row }" :position="'centered'">
                <AppButtonGroup class="d-flex justify-content-center">
                  <AppCheckPermission permission="classroom.newSletters.edit">
                    <AppButtonEdit @click="toggleDrawer(row?.[1])"></AppButtonEdit>
                  </AppCheckPermission>
                </AppButtonGroup>
              </AppDatatableColumn>
            </AppDatatable>
          </div>
        </div>
      </template>

      <!--   <EditActivitiesTeacherDrawer :isMounted="isMounted" v-model:isVisible="showDrawerEdit" @reload-data="reloadData" :courseId="courseIdDrawerEdit!" :activityId="activityIdDrawerEdit!" /> -->

      <ObservationBulletinDrawer v-model:isVisible="isVisibleDrawer" :userId="currentUserId" :courseId="courseId" :periodId="periodId" @reload-data="getActivitySummaryByPeriod">
        <!-- :isVisible="isVisibleDrawer" @update:isVisible="toggleDrawer" -->
      </ObservationBulletinDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch, computed } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useRoute } from 'vue-router';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
//import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { CourseDto } from '../dtos/course.dto';
import { GetActivitiesSummaryService } from '../services/getActivitiesSummary.service';
import { GetActivitiesSummaryByPeriodIdService } from '../services/getActivitiesSummaryByPeriodId.service';

import { useHeaderStore } from '../../../stores/header.store';
import TabsTeacher from '../components/TabsTeacher.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
//import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
//import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { GetCourseByIdService } from '../services/getCourseById.service';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
//import AppDrawer from '../../../shared/components/AppDrawer.vue';
import ObservationBulletinDrawer from '../components/ObservationBulletinDrawer.vue';

const getActivitiesSummaryByPeriodIdService = new GetActivitiesSummaryByPeriodIdService();
const getActivitiesSummaryService = new GetActivitiesSummaryService();
const getCourseByIdService = new GetCourseByIdService();
export default defineComponent({
  name: 'ActivitySummary',
  components: {
    AppAutocomplete,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    //AppEmptyResponse,
    AppCheckPermission,
    TabsTeacher,
    AppButtonEdit,
    //AppButtonDelete,
    ObservationBulletinDrawer,
    AppDatatable,
    AppDatatableColumn,
  },

  setup() {
    //const router = useRouter();
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.activitiesTeacher.title');
    const learningOutcomes = ref();
    const isCourseExecution = route.path.search('execution-of-courses') >= 0;

    useMeta({ title: t(title) });
    const routes: BreadCrumbsType[] = [
      {
        name: !isCourseExecution ? `classroom.homeTeacher.title` : 'Ejecución de cursos',
        url: {
          name: !isCourseExecution ? 'administration.homeTeacher' : 'training.executionOfCourses',
        },
      },
      {
        name: title,
      },
    ];

    const course: Ref<CourseDto | null> = ref(null);
    const consolidate: Ref<any[]> = ref([]);
    const subtitle: Ref<string> = ref('');
    const periods: Ref<any[]> = ref([]);
    const syncLmsNew = ref();
    const periodId = ref();
    const courseId = ref(parseInt(route.params.courseId.toString(), 10));
    const currentUserId = ref();
    /*  
    const showDrawerCreate = ref(false);
    const toggleDrawerCreate = () => {
      showDrawerCreate.value = !showDrawerCreate.value; // Cambia el estado de visibilidad
    };*/ /*
    const courseIdDrawerEdit = ref<number | null>(null);
    const activityIdDrawerEdit = ref<number | null>(null);
    */ /*
    const showDrawerEdit = ref(false);*/

    const ratingScalesList: Ref<any[]> = ref([]);
    const isQualitativeGradingId = ref();
    const isVisibleDrawer = ref(false);

    const toggleDrawer = (userId: number) => {
      currentUserId.value = userId;
      console.log(userId);
      isVisibleDrawer.value = !isVisibleDrawer.value;
    };
    const loadingTable = ref(false);
    const loading = ref(true);

    //const serviceTable = new GetActivitiesSummaryNewTable();

    const params = computed(() => ({
      courseId: courseId.value,
      periodId: periodId.value,
    }));

    onMounted(async () => {
      try {
        //courseId.value = parseInt(route.params.courseId.toString(), 10);
        const courses = await getCourseByIdService.run(courseId.value);

        isQualitativeGradingId.value = courses?.level.isQualitativeGrading;
        ratingScalesList.value = courses?.ratingScales;

        await getRelatedDataActivitiesSummary();

        subtitle.value = `${course.value?.name}`;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };

        await getActivitySummaryByPeriod();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(periodId, async () => {
      reloadData();
      /* await getActivitySummaryByPeriod();
      updateDatatableService.run();*/
    });

    const getRelatedDataActivitiesSummary = async () => {
      try {
        let params = {
          unassigned: 0,
        };
        courseId.value = parseInt(route.params.courseId.toString(), 10);
        let response = await getActivitiesSummaryService.run(courseId.value, params);
        syncLmsNew.value = response.courseData.syncLmsNew;
        periodId.value = response.periods[0]?.id;
        course.value = response.courseData;
        // Manipular los datos
        periods.value = response.periods.map((period: any) => {
          return {
            ...period,
            name: syncLmsNew.value === 1 && period.periodLmsName ? period.periodLmsName : period.name,
          };
        });
        periods.value.push({
          id: 'null',
          institutionId: 127,
          academicPeriodId: null,
          abbreviation: 'PF',
          startDate: null,
          endDate: null,
          percent: null,
          percentRepproved: null,
          order: null,
          active: null,
          startDateScoreUpload: null,
          endDateScoreUpload: null,
          startDateRetrievalLock: null,
          endDateRetrievalLock: null,
          createdAt: null,
          updatedAt: null,
          periodLmsName: null,
          name: 'Periodo final',
        });
      } catch (e) {
        console.log('error', e);
      }
    };

    const getActivitySummaryByPeriod = async () => {
      //loadingTable.value = true;

      try {
        const auxPeriodId = periodId.value === 'null' ? null : periodId.value;

        const response = await getActivitiesSummaryByPeriodIdService.run(courseId.value, auxPeriodId!);
        consolidate.value = response?.activitiesSummary?.consolidate || response?.learningOutcomes.map((item: any) => [item.userName, item.userId, 0, 0]) || [];
        learningOutcomes.value = response?.learningOutcomes || [];
      } catch (error) {
        console.error(error);
      }
      //loadingTable.value = false;
    };

    const consolidatedData = computed(() =>
      consolidate.value.map((record) => {
        const userId = record[1]; // El ID del usuario está en la posición 1

        // Buscar observación en learningOutcomes
        const matchedOutcome = learningOutcomes.value.find((outcome: any) => outcome.userId === userId && outcome.id === null);

        // Devolvemos el nuevo array con la observación agregada
        return [...record, matchedOutcome?.observations ?? null];
      })
    );

    const reloadData = async () => {
      try {
        loadingTable.value = true;
        await getActivitySummaryByPeriod();
        loadingTable.value = false;
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    };

    return {
      params,
      subtitle,
      loading,
      routes,
      title,
      t,
      loadingTable,
      consolidatedData,
      periods,
      periodId,
      courseId,
      currentUserId,

      isQualitativeGradingId,
      ratingScalesList,
      isVisibleDrawer,
      toggleDrawer,
      //getRelatedDataActivitiesSummary,
      getActivitySummaryByPeriod,
    };
  },
});
</script>

<style scoped>
.container-tables {
  background-color: white;
  padding: 23px 22px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

/*.buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}*/
/*.content-buttons-views {
  margin-left: auto;
}
.buttons-views {
  display: flex;
  gap: 3px;
}
.buttons-activities {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
}*/

tr.fila-intermedia:nth-child(2n) {
  background-color: #e4e4e4;
}

table thead tr th {
  color: #3c4248;
  font-size: 12px;
  padding: 0.5rem;
}

table tbody tr td {
  font-size: 14px;
  padding: 0.5rem;
  border-bottom: 1px solid #eedd;
}
/*
.note-cell {
  max-width: 160px;
  min-width: 160px;
  text-align: center;
  border: 1px solid #ccc;
}*/

body {
  overflow-x: hidden;
}
/*
.message {
  text-align: center;
  font-weight: bold;
  margin-top: 200px;
}
*/
.border-end {
  border-right: 1px solid #c7c7c7 !important;
}

.vs--searchable .vs__dropdown-toggle {
  padding: 40px !important;
  margin: 19%;
}

/*.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}*/
.sticky-column-thead {
  position: sticky;
  left: 0;
  background-color: rgb(228, 228, 228); /* Fondo blanco para evitar superposición visual */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* Añade una sombra para resaltar */
  z-index: 10;
}
tbody tr:nth-child(odd) .sticky-column-tbody {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: #ffffff; /* Fondo blanco para filas impares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

tbody tr:nth-child(even) .sticky-column-tbody {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: rgb(228, 228, 228); /* Fondo gris claro para filas pares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}
.sticky-column-thead-finish {
  position: sticky;
  right: 0;
  background-color: rgb(228, 228, 228); /* Fondo blanco para evitar superposición visual */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* Añade una sombra para resaltar */
  z-index: 10;
  border-left: 1px solid rgb(204, 204, 204);
}
tbody tr:nth-child(odd) .sticky-column-tbody-finish {
  position: sticky;
  right: 0;
  z-index: 2;
  background-color: #ffffff; /* Fondo blanco para filas impares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border-left: 1px solid rgb(204, 204, 204);
}

tbody tr:nth-child(even) .sticky-column-tbody-finish {
  border-left: 1px solid rgb(204, 204, 204);
  z-index: 2;

  position: sticky;
  right: 0;
  background-color: rgb(228, 228, 228); /* Fondo gris claro para filas pares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}
@media (max-width: 820px) {
  .sticky-column-thead,
  tbody tr:nth-child(odd) .sticky-column-tbody,
  tbody tr:nth-child(even) .sticky-column-tbody {
    position: static;
    box-shadow: none;
  }
  .sticky-column-thead-finish,
  tbody tr:nth-child(odd) .sticky-column-tbody-finish,
  tbody tr:nth-child(even) .sticky-column-tbody-finish {
    position: static;
    box-shadow: none;
  }
}
.table-responsive {
  overflow-x: auto;
}

.responsive-table {
  min-width: 100%;
  /* Si es necesario, puedes ajustar el table-layout:
     table-layout: fixed;
  */
}
/*.app-autocomplete-fixed {
  min-width: 140px !important;
}*/
</style>
