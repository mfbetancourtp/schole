<template>
  <AppBaseList :title="title" :subtitle="subtitle">
    <template v-slot:actions>
      <AppCheckPermission permission="classroom.activitiesTeacher.create">
        <AppButton style="color: white" label="classroom.activitiesTeacher.syncLMS" @click="syncLMS()"></AppButton>
      </AppCheckPermission>
      <AppButtonBack @click="goBack"></AppButtonBack>
      <AppCheckPermission permission="classroom.activitiesTeacher.create">
        <!--  <AppButton
          style="color: white"
          label="core.newFemaleActivities"
          :to="{
            name: !isCourseExecution ? 'administration.homeTeacher.activities.create' : 'training.executionOfCoursesActivitiesCreate',
            params: { courseId },
          }"
        ></AppButton> -->
        <AppButton style="color: white" label="core.newFemaleActivities" @click="toggleDrawerCreate"></AppButton>
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <TableDashboard :cardsDataProp="cardsData"></TableDashboard>
        <section class="mt-3">
          <div class="d-flex justify-content-between contentFilter" @click="changeFilter()">
            <div class="w-100 d-flex justify-content-end">
              <div class="mb-3 tw-w-full md:tw-w-72">
                <AppFilter v-model="periodId" filter-name="Periodos">
                  <label for="periodName">Periodos</label>
                  <v-select class="bg-white" input-id="periodId" :filterable="false" v-model="periodId" :options="periods" :reduce="(periods: any) => periods.id" label="name"> </v-select>
                </AppFilter>
              </div>
            </div>
          </div>
        </section>

        <AppLoading v-if="loadingActivities"></AppLoading>

        <section v-else>
          <AppEmptyResponse v-if="!activities.length" :show-image="true"></AppEmptyResponse>

          <div v-else class="grid-cards mt-3">
            <AppCard v-for="(item, index) in activities" :key="index">
              <template #body>
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span v-if="item.activityCategory.id" class="rounded-pill bg-primary bg-opacity-25 text-secondary ps-2 pe-2">
                      {{ item.activityCategory.name }}
                      {{ item.activityCategory.percent ? ' (' + item.activityCategory.percent + '%)' : '' }}
                    </span>
                  </div>

                  <template v-if="!item.notQualityDeliveries && item.qualityDeliveries">
                    <AppIcon class="icon-size-8 m-1" style="color: #198754" icon="check-circle"></AppIcon>
                  </template>
                </div>

                <div class="pt-3">
                  <h6 class="card-title m-0">{{ item.name }}</h6>
                  <span style="color: #6478b1">{{ t('classroom.activitiesTeacher.deliverySummary') }}</span>

                  <hr />

                  <div class="d-flex align-items-center gap-1">
                    <AppIcon style="color: #555" icon="clock"></AppIcon>
                    <div class="d-flex flex-column">
                      <span v-if="item.dateSince">{{ dayjs(item.dateSince).format('YYYY-MM-DD h:mm A') }}</span>

                      <span v-if="item.dateUntil">{{ dayjs(item.dateUntil).format('YYYY-MM-DD h:mm A') }}</span>
                    </div>
                  </div>

                  <div class="ms-1 mt-3">
                    <span>{{ t('classroom.activitiesTeacher.qualityDeliveries') }}</span>
                    <span class="badge rounded-pill text-bg-primary bg-primary ms-1">{{ item.qualityDeliveries ?? 0 }}</span>
                  </div>

                  <div class="ms-1">
                    <span>{{ t('classroom.activitiesTeacher.notQualityDeliveries') }}</span>
                    <span class="badge rounded-pill text-bg-primary bg-primary ms-1">{{ item.notQualityDeliveries ?? 0 }}</span>
                  </div>

                  <div class="ms-1">
                    <span>{{ t('classroom.activitiesTeacher.notDeliveries') }}</span>
                    <span class="badge rounded-pill text-bg-primary bg-primary ms-1">{{ item.notQualityDeliveries ?? 0 }}</span>
                  </div>
                </div>
              </template>

              <template #footer>
                <div class="d-flex justify-content-between">
                  <AppCheckPermission permission="classroom.activitiesTeacher.edit">
                    <AppButton
                      v-tooltip="'classroom.activitiesTeacher.qualify'"
                      icon="clipboard-check"
                      outlined
                      :to="{
                        name: !isCourseExecution ? 'administration.homeTeacher.activities.qualifyActivity' : 'training.executionOfCoursesActivitiesQualify',
                        params: { courseId: courseId, activityId: item.id },
                      }"
                    ></AppButton>
                  </AppCheckPermission>

                  <AppButtonGroup>
                    <AppCheckPermission permission="classroom.activitiesTeacher.edit">
                      <!--  <AppButtonEdit
                        :to="{
                          name: !isCourseExecution ? 'administration.homeTeacher.activities.edit' : 'training.executionOfCoursesActivitiesEdit',
                          params: { courseId: courseId, activityId: item.id },
                        }"
                      >
                        {{ courseId }}</AppButtonEdit
                      > -->
                      <AppButtonEdit @click="toggleDrawerEdit(courseId, item.id)"></AppButtonEdit>
                    </AppCheckPermission>

                    <AppCheckPermission permission="classroom.activitiesTeacher.delete">
                      <AppButtonDelete @click="openConfirmDelete(item)"></AppButtonDelete>
                    </AppCheckPermission>
                  </AppButtonGroup>
                </div>
              </template>
            </AppCard>
          </div>
        </section>

        <AppModal v-model="modalDelete">
          <template v-if="modalDelete && currentActivity">
            <AppConfirmDeleteModal :entity="currentActivity.name" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
          </template>
        </AppModal>

        <CreateActivitiesTeacherDrawer v-model:isVisible="showDrawerCreate" @reload-data="reloadData" />
        <EditActivitiesTeacherDrawer v-if="showDrawerEdit" v-model:isVisible="showDrawerEdit" @reload-data="reloadData" :courseId="courseIdDrawerEdit" :activityId="activityIdDrawerEdit" />
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, reactive, ref, watch } from 'vue';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import CreateActivitiesTeacherDrawer from '../components/CreateActivitiesTeacherDrawer.vue';
import EditActivitiesTeacherDrawer from '../components/EditActivitiesTeacherDrawer.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { TeacherActivityDto } from '../dtos/teacherActivity.dto';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { SyncActivitiesLmsService } from '../services/syncActivitiesLms.service';
import { DeleteActivityByIdService } from '../services/deleteActivityById.service';
import { GetTeacherActivitiesService } from '../services/getTeacherActivities.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GetActivitiesSummaryFilterPeriodsService } from '../services/getActivitiesSummaryFilterPeriods.service';
import { GetTeacherActivitiesFilterPeriodsService } from '../services/getTeacherActivitiesFilterPeriods.service';
import { GetActivitiesDashboardService } from '../services/getActivitiesDashboard.service';
import { GetActivitiesDashboardFilterService } from '../services/getActivitiesDashboardFilter.service';

import TableDashboard from '../components/TableDashboard.vue';

const getActivitiesDashboardService = new GetActivitiesDashboardService();
const getActivitiesDashboardFilterService = new GetActivitiesDashboardFilterService();
const getTeacherActivitiesService = new GetTeacherActivitiesService();
const syncActivitiesLmsService = new SyncActivitiesLmsService();
const deleteActivityByIdService = new DeleteActivityByIdService();
const getCourseByIdService = new GetCourseByIdService();
const getActivitiesSummaryFilterPeriodsService = new GetActivitiesSummaryFilterPeriodsService();
const getTeacherActivitiesFilterPeriodsService = new GetTeacherActivitiesFilterPeriodsService();

dayjs.extend(isoWeek);

export default defineComponent({
  name: 'ActivitiesTeacher',
  components: {
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    AppIcon,
    TableDashboard,
    CreateActivitiesTeacherDrawer,
    EditActivitiesTeacherDrawer,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.activitySummary.title');
    const isCourseExecution = route.path.search('execution-of-courses') >= 0;

    useMeta({ title: t(title) });
    const router = useRouter();
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

    const currentActivity: Ref<TeacherActivityDto | null> = ref(null);
    const activities: Ref<TeacherActivityDto[]> = ref([]);
    const subtitle: Ref<string> = ref('');
    const filter: Ref<number> = ref(0);
    const periods: Ref<any[]> = ref([]);
    const courseId = ref();
    const course: { value: any | null } = reactive({
      value: null,
    });

    const loadingActivities = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    const dateSince: { value: any } = reactive({ value: null });
    const dateUntil: { value: any } = reactive({ value: null });

    const periodId = ref<any>();

    const periodName = ref();

    const dataDasboard = ref();
    const cardsData = ref([{}]);

    const showDrawerCreate = ref(false);

    const toggleDrawerCreate = () => {
      showDrawerCreate.value = !showDrawerCreate.value; // Cambia el estado de visibilidad
    };
    const courseIdDrawerEdit = ref<number | null>(null);
    const activityIdDrawerEdit = ref<number | null>(null);

    const showDrawerEdit = ref(false);
    const toggleDrawerEdit = (courseId: number, activityId: number) => {
      courseIdDrawerEdit.value = courseId;
      activityIdDrawerEdit.value = activityId;
      showDrawerEdit.value = !showDrawerEdit.value; // Cambia el estado de visibilidad
    };

    const reloadData = async () => {
      try {
        await getData();
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    };

    onMounted(async () => {
      try {
        courseId.value = parseInt(route.params.courseId.toString(), 10);

        course.value = await getCourseByIdService.run(courseId.value);
        subtitle.value = course.value?.name;
        let params = {
          unassigned: 1,
        };
        periods.value = await getActivitiesSummaryFilterPeriodsService.run(courseId.value, params);

        periods.value = periods.value.map((period: any) => {
          return {
            ...period,
            id: period.id ? period.id : 'null',
          };
        });

        const savedPeriodId = localStorage.getItem('periodId');
        const savedPeriodName = localStorage.getItem('periodName');

        if (savedPeriodId) {
          periodId.value = savedPeriodId === 'null' ? null : Number(savedPeriodId);
        } else {
          periodId.value = 0;
        }

        if (savedPeriodName) {
          periodName.value = savedPeriodName;
        }
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };

        await getData();
        await getDataDashboard();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch([periodId, filter, dateSince, dateUntil], async () => {
      if (!periodId.value) {
        return;
      }

      const selectedPeriod = periods.value.find((period) => period.id === periodId.value);
      const selectedPeriodName = selectedPeriod ? selectedPeriod.name : '';

      localStorage.setItem('periodId', String(periodId.value));
      localStorage.setItem('periodName', selectedPeriodName);
      await getData();
      await getDataDashboard();
    });
    const getData = async () => {
      loadingActivities.value = true;
      try {
        let response;

        if (periodId.value === 0 || periodId.value === null) {
          response = await getTeacherActivitiesService.run(courseId.value, {});
        } else {
          response = await getTeacherActivitiesFilterPeriodsService.run(courseId.value, { periodId: periodId.value });
        }

        activities.value = response.teacherActivities;
        await getDataDashboard();
      } catch (e) {
        console.log(e);
      }
      loadingActivities.value = false;
    };
    const getDataDashboard = async () => {
      try {
        if (periodId.value === 0 || periodId.value === null) {
          dataDasboard.value = await getActivitiesDashboardFilterService.run(courseId.value);
        } else {
          dataDasboard.value = await getActivitiesDashboardService.run(courseId.value, periodId.value);
        }
      } catch (e) {
        console.log(e);
      }
      // dataDasboard.value = await getActivitiesDashboardService.run(courseId.value, periodId.value);

      cardsData.value = [
        {
          icon: 'activities',
          fillColor: '#91deaa',
          title: 'Total Actividades',
          data: dataDasboard.value.totalActivities,
          border: 'border-right: 1px solid #9ea1a5;',
        },
        {
          icon: 'notEvaluatedActivities',
          fillColor: '#ffe399',
          title: 'Actividades Calificadas',
          data: dataDasboard.value.evaluatedActivities,
          border: 'border-right: 1px solid #9ea1a5;',
        },
        {
          icon: 'evaluatedActivities',
          fillColor: '#efb3f9',
          title: 'Actividades sin Calificar',
          data: dataDasboard.value.notEvaluatedActivities,
          border: 'border-right: 1px solid #9ea1a5;',
        },
        {
          icon: 'activitiesWithOutPeriod',
          fillColor: '#efb3f9',
          title: 'Actividades sin Periodo',
          data: dataDasboard.value.activitiesWithOutPeriod,
          border: 'border-right: 1px solid #9ea1a5;',
        },
        {
          icon: 'learningOutcomes',
          fillColor: '#59cae0',
          title: 'Desempeños Asociados',
          data: dataDasboard.value.associatedLearningOutcomes + '/' + dataDasboard.value.learningOutcomes,
          border: 'border-right: 1px solid #9ea1a5;',
        },
        {
          icon: 'topics',
          fillColor: '#fd8686',
          title: 'Temas Vistos',
          data: dataDasboard.value.associatedTopics + '/' + dataDasboard.value.topics,
        },
      ];
    };

    // const calculateFilterDate = () => {
    //   const filterC = filter.value;
    //   const currentDate = dayjs();

    //   let weekStart = currentDate.clone().startOf('isoWeek');
    //   let weekEnd = currentDate.clone().endOf('isoWeek');

    //   if (filterC === 0) {
    //     weekEnd.subtract(1, 'day');

    //     return {
    //       dateSince: weekStart.toISOString().split('T')[0],
    //       dateUntil: weekEnd.toISOString().split('T')[0],
    //     };
    //   } else if (filterC >= 1 && filterC <= 3) {
    //     weekStart = weekStart.subtract(filterC, 'week');
    //     weekEnd = weekEnd.subtract(filterC, 'week');
    //     weekEnd.subtract(1, 'day');

    //     return {
    //       dateSince: weekStart.toISOString().split('T')[0],
    //       dateUntil: weekEnd.toISOString().split('T')[0],
    //     };
    //   } else if (filterC === 5) {
    //     return {
    //       dateSince: dateSince.value,
    //       dateUntil: dateUntil.value,
    //     };
    //   }

    //   return {};
    // };

    const changeFilter = async () => {
      if (filter.value < 5) await getData();
    };

    const syncLMS = async () => {
      try {
        await syncActivitiesLmsService.run(courseId.value);
        await getData();
      } catch (e) {
        console.log(e);
      }
    };

    const openConfirmDelete = async (data: TeacherActivityDto) => {
      currentActivity.value = data;

      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentActivity.value) {
        await deleteActivityByIdService.run(currentActivity.value.id);

        currentActivity.value = null;
      }

      await getData();

      modalDelete.value = false;
    };
    const goBack = () => {
      router.go(-1);
    };

    return {
      isCourseExecution,
      subtitle,
      routes,
      title,
      t,

      loadingActivities,
      currentActivity,
      modalDelete,
      activities,
      dateSince,
      dateUntil,
      courseId,
      loading,
      filter,

      showDrawerCreate,
      courseIdDrawerEdit,
      activityIdDrawerEdit,
      showDrawerEdit,
      reloadData,
      toggleDrawerCreate,
      toggleDrawerEdit,

      openConfirmDelete,
      confirmDelete,
      changeFilter,
      getData,
      syncLMS,
      periodId,
      periods,
      periodName,
      course,
      cardsData,
      goBack,
      dayjs,
    };
  },
});
</script>

<style scoped>
.contentFilter .filter {
  background: #fff;
  margin-right: 1rem;
  padding: 0.3rem 1rem;
  border-radius: 28px;
  cursor: pointer;
}

.focus {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.focus:hover {
  background-color: rgba(0, 0, 0, 0.2) !important;
}

.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}
</style>
