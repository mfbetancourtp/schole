<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <!-- <AppButtonBack :to="{ name: 'administration.homeStudent' }"></AppButtonBack> -->
      <AppButtonBack @click="goBack" />
    </template>
    <template v-slot:content>
      <div style="display: none">
        <SelectionStudentsByParent @update-student-user-id="updateStudentUserId"></SelectionStudentsByParent>
      </div>
      <TabsStudent></TabsStudent>
      <AppLoading v-if="loading"></AppLoading>

      <div v-if="!loading && relatedData" class="mb-4">
        <TableDashboard :cards-data-prop="cardsData"></TableDashboard>

        <!-- <section class="mt-3 mb-3">
          <section class="d-flex justify-content-end align-items-center">
            <AppDatatableFilters v-show="true">
              <div class="mb-3 tw-flex-1">
                <label for="courseId">{{ t('Asignaturas') }}</label>
                <AppAutocomplete :options="relatedData.courses" :input-id="'courseId'" v-model="courseId"> </AppAutocomplete>
              </div>
              <div class="mb-3 tw-flex-1">
                <label for="state">{{ t('Estado') }}</label>
                <v-select :options="statesOptions" :input-id="'state'" v-model="state" @update:modelValue="handleAttendanceStateChange"></v-select>
              </div>
              <div class="d-flex gap-1 align-items-end">
                <AppFormField :label="'Inicia'">
                  <input type="date" class="form-control" v-model="dateStart" @input="handlefFecIniChange" />
                </AppFormField>

                <AppFormField :label="'Termina'">
                  <input type="date" class="form-control" v-model="dateEnd" @input="handlefFecFinChange" />
                </AppFormField>
              </div>
            </AppDatatableFilters>
          </section>
        </section> -->

        <!-- <AppEmptyResponse v-if="!attendanceStudent.attendances" :size="'sm'" :subtitle="false"></AppEmptyResponse> -->
        <AppDatatable :service="service" :params="params" :name="title" :enable-search-filter="false">
          <template v-slot:filters>
            <!-- <AppFilter v-model="courseId">
              <label for="courseId">{{ t('Asignaturas') }}</label>
                <AppAutocomplete :options="relatedData.courses" :input-id="'courseId'" v-model="courseId"> </AppAutocomplete>
            </AppFilter> -->
            <AppFilter v-model="state">
              <label for="state">{{ t('Estado') }}</label>
              <v-select :options="statesOptions" :input-id="'state'" v-model="state" @update:modelValue="handleAttendanceStateChange"></v-select>
            </AppFilter>
            <AppFilter>
              <AppFormField :label="'Inicia'">
                <input type="date" class="form-control" v-model="dateStart" @input="handlefFecIniChange" />
              </AppFormField>

              <AppFormField :label="'Termina'">
                <input type="date" class="form-control" v-model="dateEnd" @input="handlefFecFinChange" />
              </AppFormField>
            </AppFilter>
          </template>
          <AppDatatableColumn label="Título" field="title" v-slot="{ row }" :width="400">
            {{ row.title ?? '---' }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Inicio" field="dateSince" v-slot="{ row }" :width="200">
            {{ row.dateSince }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Cierre" field="dateUntil" v-slot="{ row }" :width="200">
            {{ row.dateUntil }}
          </AppDatatableColumn>
          <!-- <AppDatatableColumn label="Temas" field="topics" v-slot="{ row }" :width="400">
            {{ row.topics.join(', ') ?? '---' }}
          </AppDatatableColumn> -->
          <AppDatatableColumn label="Estado" :position="'centered'" v-slot="{ row }" :width="150">
            <div class="d-flex justify-content-center">
              <AppBadge :label="row.state" variant="primary" class="rounded-pill" />
            </div>
          </AppDatatableColumn>
        </AppDatatable>
        <!-- <div class="table-container">

          <table class="w-100 responsive-table">
            <thead>
              <tr style="background-color: #ccc">
                <th rowspan="2" class="text-center border-end border-bottom border-left border-right" style="width: 160px; white-space: nowrap; word-wrap: break-word; text-align: center">Título</th>
                <th
                  class="text-center align-items-center border-end border-bottom"
                  :style="{
                    borderLeft: '1px solid #ccc',
                    borderRight: '1px solid #ccc',
                    minWidth: '160px',
                    maxWidth: '160px',
                  }"
                >
                  Inicio
                </th>
                <th
                  class="text-center align-items-center border-end border-bottom"
                  :style="{
                    borderLeft: '1px solid #ccc',
                    borderRight: '1px solid #ccc',
                    minWidth: '160px',
                    maxWidth: '160px',
                  }"
                >
                  Cierre
                </th>
                <th
                  v-if="attendanceStudent.attendances.topics"
                  class="text-center align-items-center border-end border-bottom"
                  :style="{
                    borderLeft: '1px solid #ccc',
                    borderRight: '1px solid #ccc',
                    minWidth: '160px',
                    maxWidth: '160px',
                  }"
                >
                  Temas
                </th>
                <th
                  class="text-center align-items-center border-end border-bottom"
                  :style="{
                    borderLeft: '1px solid #ccc',
                    borderRight: '1px solid #ccc',
                    minWidth: '160px',
                    maxWidth: '160px',
                  }"
                >
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="fila-intermedia" v-for="(attendances, index) in attendanceStudent.attendances?.data" :key="index">
                <td style="width: 200px; white-space: nowrap; word-wrap: break-word; text-align: center; border-right: 1px solid #ccc">
                  {{ attendances.title }}
                </td>
                <td style="width: 200px; white-space: nowrap; word-wrap: break-word; text-align: center; border-right: 1px solid #ccc">
                  {{ attendances.dateSince }}
                </td>
                <td style="width: 200px; white-space: nowrap; word-wrap: break-word; text-align: center; border-right: 1px solid #ccc">
                  {{ attendances.dateUntil }}
                </td>
                <td style="width: 200px; white-space: nowrap; word-wrap: break-word; text-align: center; border-right: 1px solid #ccc" v-if="attendanceStudent.attendances.topics">
                  {{ attendances.topics.join(', ') }}
                </td>
                <td style="width: 200px; white-space: nowrap; word-wrap: break-word; text-align: center; border-right: 1px solid #ccc">
                  {{ attendances.state }}
                </td>
              </tr>
            </tbody>
          </table>
        </div> -->
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch, onUnmounted } from 'vue';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import SelectionStudentsByParent from '../components/SelectionStudentsByParent.vue';

import { GetAttendaceTableService } from '../services/getAttendanceTable.service';
import { GetRelatedDataHomeStudentService } from '../services/getRelatedDataHomeStudent.service';
import { useHeaderStore } from '../../../stores/header.store';
import { useTabsStudentStore } from '../../../stores/tabsStudent.store';
import TabsStudent from '../components/TabsStudent.vue';
import TableDashboard from '../components/TableDashboard.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import { GetAttendaceTablePaginateService } from '../services/getAttendanceTablePaginate.service';
import AppFilter from '../../../shared/components/AppFilter.vue';

const getRelatedDataHomeStudentService = new GetRelatedDataHomeStudentService();
const getAttendaceTableService = new GetAttendaceTableService();

dayjs.extend(isoWeek);

export default defineComponent({
  name: 'StudentSchedule',
  components: {
    SelectionStudentsByParent,
    AppBaseList,
    AppLoading,
    TabsStudent,
    TableDashboard,
    AppFormField,
    AppButtonBack,
    AppDatatable,
    AppDatatableColumn,
    AppBadge,
    AppFilter,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.studentAttendance.title');
    const subtitle = t('classroom.studentSchedule.subtitle');
    const tabsStore = useTabsStudentStore();
    const router = useRouter();
    const service = new GetAttendaceTablePaginateService();

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Salón de clases', url: '' };
    headerStorage.moduleItem = { name: 'Inicio Estudiante', url: '' };
    headerStorage.moduleSubItem = { name: title, url: '' };

    const routes = [{ name: title }];
    useMeta({ title: title });

    const relatedData: Ref<any> = ref(null);
    const attendanceStudent = ref([{}]);
    const filter = ref(0);

    const notFound = ref(false);
    const loading = ref(false);

    const courseId = ref();
    const userId = ref();
    const state = ref();

    const dateStart = ref();
    const dateEnd = ref();

    const cardsData = ref([{}]);

    const statesOptions = ['Asistió', 'Llegada tarde CE', 'Llegada tarde SE', 'Inasistencia SE', 'Inasistencia CE'];

    const params: any = computed(() => {
      const params: any = {};

      params.fecIni = dateStart.value;
      params.fecFin = dateEnd.value;

      params.userId = userId.value;
      params.courseId = courseId.value;
      params.state = state.value;
      params.paginated = true;

      return params;
    });
    const goBack = () => {
      // --> Opción A: leerlo desde el store
      const tab = tabsStore.activities.active ? tabsStore.activities : tabsStore.atendence;

      if (tab.returnTo) {
        router.push(tab.returnTo);
      } else {
        router.go(-1);
      }

      // --> Opción B: si prefieres leerlo directamente de la query:
      // const returnTo = route.query.returnTo as string;
      // if (returnTo) router.push(returnTo);
      // else router.go(-1);
    };
    onUnmounted(() => {
      tabsStore.persistState();
    });

    const handlefFecIniChange = async () => {
      await getTimetables();
    };
    const handlefFecFinChange = async () => {
      await getTimetables();
    };
    const handleAttendanceStateChange = async () => {
      await getTimetables();
    };

    watch(courseId, async () => {
      await getTimetables();
    });
    watch(filter, async () => {
      await getTimetables();
    });

    const updateStudentUserId = async (studentUserId: any) => {
      loading.value = true;

      {
        // courseId.value = parseInt(route.query.courseId as string, 10);
        courseId.value = tabsStore.activities.params?.courseId;
      }
      if (studentUserId) {
        userId.value = studentUserId as number;
      }

      if (userId.value) {
        const params = { userId: userId.value as number };

        relatedData.value = await getRelatedDataHomeStudentService.run(params);
      } else {
        relatedData.value = await getRelatedDataHomeStudentService.run();
      }

      await getTimetables();
      tabsStore.persistState();
      loading.value = false;
    };

    const getTimetables = async () => {
      try {
        notFound.value = false;

        const response = await getAttendaceTableService.run(params.value);
        attendanceStudent.value = response;
        cardsData.value = [
          {
            icon: 'activities',
            fillColor: '#91deaa',
            title: 'Total Asistencias',
            data: attendanceStudent.value?.totalAttendance,
            border: 'border-right: 1px solid #9ea1a5;',
          },
          {
            icon: 'notEvaluatedActivities',
            fillColor: '#ffe399',
            title: 'Llegadas Tarde CE',
            data: attendanceStudent.value?.delayArrivalsWithExcuse,
            border: 'border-right: 1px solid #9ea1a5;',
          },
          {
            icon: 'evaluatedActivities',
            fillColor: '#efb3f9',
            title: 'Llegadas Tarde SE',
            data: attendanceStudent.value.delayArrivalsWithOutExcuse,
            border: 'border-right: 1px solid #9ea1a5;',
          },
          {
            icon: 'learningOutcomes',
            fillColor: '#59cae0',
            title: 'Inasistencias CE',
            data: attendanceStudent.value.absencesWithExcuse,
            border: 'border-right: 1px solid #9ea1a5;',
          },
          {
            icon: 'topics',
            fillColor: '#fd8686',
            title: 'Inasistencias SE',
            data: attendanceStudent.value.absencesWithOutExcuse,
          },
        ];

        if (!attendanceStudent.value.length) {
          notFound.value = true;
        }
      } catch (e) {
        console.log(e);
      }
    };

    const changeFilter = async () => {
      await getTimetables();
    };

    return {
      subtitle,
      routes,
      title,
      t,

      relatedData,
      courseId,
      notFound,
      attendanceStudent,
      loading,
      filter,

      updateStudentUserId,
      changeFilter,
      cardsData,

      state,
      statesOptions,
      handleAttendanceStateChange,
      handlefFecIniChange,
      handlefFecFinChange,

      dateStart,
      dateEnd,

      dayjs,
      goBack,
      service,
      params,
    };
  },
});
</script>

<style scoped>
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

.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
}

.contentFilter .filter {
  background: #fff;
  margin-right: 1rem;
  padding: 0.3rem 1rem;
  border-radius: 28px;
  cursor: pointer;
}

.fs-8 {
  font-size: 0.8rem;
}

.fs-7 {
  font-size: 0.9rem;
}

.fw-bolder {
  font-weight: 600 !important;
}

.focus {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.focus:hover {
  background-color: rgba(0, 0, 0, 0.2) !important;
}
/* Contenedor de la tabla con altura fija para que la barra horizontal quede siempre visible en la parte inferior */
.table-container {
  padding-bottom: 20px;
  overflow-y: auto; /* Activa el scroll vertical si el contenido excede la altura */
  overflow-x: auto; /* Activa el scroll horizontal si la tabla es ancha */
  scrollbar-gutter: stable; /* Reserva espacio para la scrollbar */
}
</style>
