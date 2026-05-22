<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'administration.homeTeacherPlanningWeeks' }"></AppButtonBack>

      <AppCheckPermission permission="classroom.approvePlanning.edit">
        <AppButton
          style="color: white"
          :disabled="!planningWeekWithDetail"
          :label="planningWeekWithDetail?.isApproved ? 'Desaprobar Planeación' : 'Aprobar Planeación'"
          @click="ApproveDisapprovePlanning"
        ></AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="mb-3 p-4 shadow-sm">
          <section
            v-bind:class="{
              disabled: planningWeekWithDetail?.isApproved ? true : false,
            }"
          >
            <form @submit.prevent="save()">
              <div class="form-row">
                <AppFormField :form-control="v$.form.range" label="Rango" class="col-3" :disabled="planningWeekWithDetail?.isApproved">
                  <div class="d-flex gap-1 text-capitalize">
                    <!-- <span 
                      class="ps-2 pe-2 pointer border border-primary rounded-pill text-primary"
                      v-bind:class="{'bg-primary text-white': range == 'day'}"
                      @click="range = 'day'"
                    >{{ t('core.time.day') }}</span> -->

                    <span
                      v-bind:class="{
                        'bg-primary text-white': v$.form.range.$model == 'week',
                      }"
                      class="ps-2 pe-2 pointer border border-primary rounded-pill text-primary"
                      @click="v$.form.range.$model = 'week'"
                    >
                      {{ t('core.time.week') }}
                    </span>

                    <span
                      v-bind:class="{
                        'bg-primary text-white': v$.form.range.$model == 'month',
                      }"
                      class="ps-2 pe-2 pointer border border-primary rounded-pill text-primary"
                      @click="v$.form.range.$model = 'month'"
                    >
                      {{ t('core.time.month') }}
                    </span>
                  </div>
                </AppFormField>

                <AppFormField :form-control="v$.form.starDate" :label="'Inicia'">
                  <input id="startDate" type="date" class="form-control" v-model="v$.form.starDate.$model" :disabled="planningWeekWithDetail?.isApproved ? true : false" />
                </AppFormField>

                <AppFormField :form-control="v$.form.endDate" :label="'Termina'">
                  <input id="endDate" type="date" class="form-control" v-model="v$.form.endDate.$model" :disabled="planningWeekWithDetail?.isApproved ? true : false" />
                </AppFormField>
              </div>

              <AppFormField :form-control="v$.form.title" :label="'Descripción'">
                <input id="title" type="text" class="form-control" v-model="v$.form.title.$model" :disabled="planningWeekWithDetail?.isApproved ? true : false" />
              </AppFormField>
              <AppFormField :form-control="v$.form.periodId" :label="'Periodo'">
                <AppAutocomplete id="periodId" :options="periods" v-model="v$.form.periodId.$model" :disabled="planningWeekWithDetail?.isApproved ? true : false"> </AppAutocomplete>
              </AppFormField>

              <div class="d-flex justify-content-end">
                <AppCheckPermission :permission="!planningWeekWithDetail ? 'classroom.planningWeeks.create' : 'classroom.planningWeeks.edit'">
                  <AppButton :disabled="planningWeekWithDetail?.isApproved ? true : false" :label="!planningWeekWithDetail ? 'Continuar' : 'core.save'"></AppButton>
                </AppCheckPermission>
              </div>
            </form>
          </section>
        </div>

        <div class="p-4 shadow-sm" v-if="planningWeekWithDetail">
          <section v-if="level && level.useCompetencies">
            <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap">
              <h5 class="m-0">Competencias y Temática</h5>

              <AppCheckPermission permission="classroom.planningWeeks.edit">
                <div class="d-flex gap-1">
                  <AppButton
                    v-bind:class="{
                      disabled: planningWeekWithDetail?.isApproved ? true : false,
                    }"
                    :label="'Seleccionar Competencias'"
                    @click="openSelectData('competencies')"
                    :outlined="true"
                  >
                  </AppButton>

                  <AppButton
                    v-bind:class="{
                      disabled: planningWeekWithDetail?.isApproved ? true : false,
                    }"
                    :label="'Agregar Competencia'"
                    :to="{
                      name: 'administration.homeTeacher.competencies.create',
                      params: {
                        academicPeriodGroupId: route.params.academicPeriodGroupId,
                        courseId: route.params.courseId,
                        curriculumSubjectId: curriculumSubjectId,
                      },
                      query: { planningWeekId: planningWeekWithDetail.id },
                    }"
                  ></AppButton>
                </div>
              </AppCheckPermission>
            </div>

            <AppEmptyResponse v-if="!competencies.length"></AppEmptyResponse>

            <template v-for="(item, index) in competencies" :key="index">
              <div
                v-bind:class="{
                  'border-bottom': index != competencies.length - 1,
                }"
                class="d-flex justify-content-between align-items-center p-1"
              >
                <div
                  v-bind:class="{
                    disabled: planningWeekWithDetail?.isApproved ? true : false,
                  }"
                  class="d-flex align-items-center gap-2"
                >
                  <AppIcon class="text-primary pointer" style="font-size: 1rem" icon="pencil-alt" v-tooltip="'Editar'" @click="editCompetence(item.id)"></AppIcon>

                  <p class="m-0">{{ item.description }}</p>
                </div>

                <span v-if="level.useTopics" class="badge rounded-pill text-bg-primary bg-primary"> {{ item.numberTopics }} Temas </span>
              </div>
            </template>

            <hr />
          </section>

          <section>
            <div class="d-flex justify-content-between align-items-center flex-wrap">
              <h5 class="m-0">Sesiones de Clases</h5>

              <AppCheckPermission permission="classroom.planningWeeks.edit">
                <div class="d-flex gap-1">
                  <AppButton
                    v-bind:class="{
                      disabled: planningWeekWithDetail?.isApproved ? true : false,
                    }"
                    :label="'Seleccionar Sesiones de Clases'"
                    @click="openSelectData('sessions')"
                    :outlined="true"
                  >
                  </AppButton>

                  <AppButton
                    v-bind:class="{
                      disabled: planningWeekWithDetail?.isApproved ? true : false,
                    }"
                    :label="'Agregar Clase'"
                    :to="{
                      name: 'administration.homeTeacher.attendance.create',
                      params: { courseId: route.params.courseId },
                      query: {
                        academicPeriodGroupId: route.params.academicPeriodGroupId,
                        planningWeekId: planningWeekWithDetail.id,
                      },
                    }"
                  ></AppButton>
                </div>
              </AppCheckPermission>
            </div>

            <AppLoading v-if="loadingSessions"></AppLoading>

            <template v-else>
              <AppEmptyResponse v-if="!sessions.length"></AppEmptyResponse>

              <template v-for="(item, index) in sessions" :key="index">
                <div
                  v-bind:class="{
                    'border-bottom': index != sessions.length - 1,
                  }"
                  class="d-flex align-items-center p-1 gap-2"
                >
                  <AppIcon
                    v-bind:class="{
                      disabled: planningWeekWithDetail?.isApproved ? true : false,
                    }"
                    class="text-primary pointer"
                    style="font-size: 1rem"
                    icon="pencil-alt"
                    v-tooltip="'Editar'"
                    @click="editSession(item.id)"
                  ></AppIcon>

                  <div class="d-flex align-items-end gap-1">
                    <span class="text-decoration-underline text-secondary">{{ item.dateName }}</span>
                    <span style="font-weight: 500">Tema: </span>
                    <template v-if="item.topics">
                      <template v-for="(topic, index) in item.topics" :key="index">
                        <span> {{ topic.name }}{{ index < item.topics.length - 1 ? ',' : '' }} </span>
                      </template>
                    </template>
                    <span v-else class="text-muted" style="font-size: 0.9rem">(Sin tema)</span>
                  </div>
                </div>
              </template>
            </template>

            <hr />
          </section>

          <section>
            <div class="d-flex justify-content-between align-items-center flex-wrap">
              <h5 class="m-0">Actividades</h5>

              <AppCheckPermission permission="classroom.planningWeeks.edit">
                <div class="d-flex gap-1">
                  <AppButton
                    v-bind:class="{
                      disabled: planningWeekWithDetail?.isApproved ? true : false,
                    }"
                    :label="'Seleccionar Actividades'"
                    @click="openSelectData('activities')"
                    :outlined="true"
                  >
                  </AppButton>

                  <AppButton
                    v-bind:class="{
                      disabled: planningWeekWithDetail?.isApproved ? true : false,
                    }"
                    :label="'Agregar Actividad'"
                    :to="{
                      name: 'administration.homeTeacher.activities.create',
                      params: { courseId: route.params.courseId },
                      query: {
                        academicPeriodGroupId: route.params.academicPeriodGroupId,
                        planningWeekId: planningWeekWithDetail.id,
                      },
                    }"
                  ></AppButton>
                </div>
              </AppCheckPermission>
            </div>

            <AppEmptyResponse v-if="!activities.length"></AppEmptyResponse>

            <template v-for="(item, index) in activities" :key="index">
              <div
                class="d-flex justify-content-between align-items-center p-1"
                v-bind:class="{
                  'border-bottom': index != activities.length - 1,
                }"
              >
                <div
                  v-bind:class="{
                    disabled: planningWeekWithDetail?.isApproved ? true : false,
                  }"
                  class="d-flex align-items-center gap-2"
                >
                  <AppIcon class="text-primary pointer" style="font-size: 1rem" icon="pencil-alt" v-tooltip="'Editar'" @click="editActivity(item.id)"></AppIcon>

                  <p class="m-0">
                    {{ item.name }}
                    <span class="text-decoration-underline text-secondary text-capitalize">
                      {{ dayjs(item.dateSince).format('D MMM') }} -
                      {{ dayjs(item.dateUntil).format('D MMM') }}
                    </span>
                  </p>
                </div>

                <div>
                  <span v-if="item.isPublish" class="badge rounded-pill text-bg-primary bg-primary"> Publicado </span>

                  <span v-else style="font-weight: 400" class="badge rounded-pill text-primary border border-primary"> No Publicado </span>
                </div>
              </div>
            </template>
          </section>

          <AppChat v-if="!loadingComments" :row-table="'PlanningWeeks'" :comments-res="comments.value" :row-id="planningWeekWithDetail.id" @new-comment="updateComments"></AppChat>
        </div>

        <AppModal v-model="selectData" :size="'lg'">
          <template v-if="selectData && planningWeekWithDetail?.id">
            <SelectCompetenciesActivitiesSessions :key-data="selectDataKey" :planning-week-id="planningWeekWithDetail.id" @close="closeSelectData"></SelectCompetenciesActivitiesSessions>
          </template>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppChat from '../../../shared/components/AppChat.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import SelectCompetenciesActivitiesSessions from './SelectCompetenciesActivitiesSessions.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { SessionDto } from '../dtos/planningWeek.dto';
import { ActivityDto } from '../dtos/planningWeek.dto';
import { CompetencyDto } from '../dtos/planningWeek.dto';
import { RelatedDataDto } from '../dtos/planningWeek.dto';
import { PlanningWeekWithDetailDto } from '../dtos/planningWeek.dto';
import { ICreateOrUpdatePlanningWeeksService } from '../services/createOrUpdatePlanningWeeks.service';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetSessionByIdService } from '../services/getSessionById.service';
import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';
import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';
import { CreateOrUpdatePlanningWeeksService } from '../services/createOrUpdatePlanningWeeks.service';
import { GetPlanningWeeksWithDetailsService } from '../services/getPlanningWeeksWithDetails.service';
import { ApproveOrDisapprovePlanningService } from '../services/approveOrDisapprovePlanning.service';
import { GetSubjectAssignmentsService } from '../../academicPlanning/services/getSubjectAssignments.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';
import { HomeTeacherCoursesDto } from '../dtos/homeTeacherCourses.dto';
import { GetActiveCoursesService } from '../services/getActiveCourses.service';
import { GetPeriodsPlanningsWeeksService } from '../services/getPeriodsPlanningWeeks.service';
import { GetPeriodsPlanningsWeeksFormService } from '../services/getPeriodsPlanningWeeksForm.service';

const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();
const approveOrDisapprovePlanningService = new ApproveOrDisapprovePlanningService();
const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const createOrUpdatePlanningWeeksService = new CreateOrUpdatePlanningWeeksService();
const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();
const getSubjectAssignmentsService = new GetSubjectAssignmentsService();
const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getSessionByIdService = new GetSessionByIdService();
const getCourseByIdService = new GetCourseByIdService();
const getActiveCoursesService = new GetActiveCoursesService();
const getPeriodsPlanningWeeksService = new GetPeriodsPlanningsWeeksService();
const getPeriodsPlanningWeeksFormService = new GetPeriodsPlanningsWeeksFormService();

export default defineComponent({
  name: 'PlanningWeeksForm',
  components: {
    SelectCompetenciesActivitiesSessions,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppIcon,
    AppChat,
    AppAutocomplete,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array,
      required: true,
    },
    planningWeekWithDetail: {
      type: Object as PropType<PlanningWeekWithDetailDto | null>,
      default: null,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const competencies: Ref<CompetencyDto[]> = ref(props.planningWeekWithDetail?.competencies ?? []);
    const activities: Ref<ActivityDto[]> = ref(props.planningWeekWithDetail?.activities ?? []);
    const selectDataKey: Ref<'activities' | 'competencies' | 'sessions'> = ref('activities');
    const sessions: Ref<SessionDto[]> = ref(props.planningWeekWithDetail?.sessions ?? []);
    const relatedData: Ref<any | null> = ref(null);
    const title: Ref<string> = ref('');
    const periodId: Ref<number | null> = ref(null);

    const level: Ref<any> = ref(null);
    const periods: Ref<any[]> = ref([]);

    const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId as string, 10);
    const courseId = parseInt(route.params.courseId as string, 10);
    const curriculumSubjectId = ref();

    const comments: { value: any[] } = reactive({ value: [] });

    const loadingComments = ref(false);
    const loadingSessions = ref(false);
    const selectData = ref(false);
    const loading = ref(true);

    const form = reactive({
      courseId: props.planningWeekWithDetail?.courseId ?? courseId,
      title: props.planningWeekWithDetail?.title ?? '',
      starDate: props.planningWeekWithDetail?.starDate ?? '',
      endDate: props.planningWeekWithDetail?.endDate ?? '',
      range: props.planningWeekWithDetail?.range ?? ('week' as 'day' | 'week' | 'month'),
      periodId: props.planningWeekWithDetail?.periodId ?? 0,
    });
    const v$ = useVuelidate(
      {
        form: {
          courseId: { required },
          title: { required },
          starDate: { required },
          endDate: { required },
          range: { required },
          periodId: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const courses: HomeTeacherCoursesDto[] = await getActiveCoursesService.run();

        const selectedCourse = courses.find((course) => course.id === academicPeriodGroupId);

        if (selectedCourse) {
          periods.value = await getPeriodsPlanningWeeksService.run(selectedCourse.id);

          if (periods.value.length > 0) {
            periodId.value = periods.value[0].id;
          }

          title.value = `Diario de campo "${selectedCourse.degree.name} ${selectedCourse.group.name}"`;
        }

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = { name: title.value, url: '' };

        const storedPeriodId = localStorage.getItem('periodId');
        periodId.value = storedPeriodId ? JSON.parse(storedPeriodId) : null;
        level.value = await getLevelByCourseIdService.run(courseId);
        const course = await getCourseByIdService.run(courseId);

        const resp = await getSubjectAssignmentsService.run(academicPeriodGroupId);
        resp.forEach((subjectAssignment: any) => {
          if (subjectAssignment.id === course.subjectAssignmentId) {
            curriculumSubjectId.value = subjectAssignment.curriculumSubjectId;
          }
        });

        periods.value = await getPeriodsPlanningWeeksFormService.run(courseId);
        if (periods.value.length > 0) {
          periodId.value = periods.value[0].id;
        }

        if (!props.planningWeekWithDetail) {
          calculateDate();
        } else {
          await updateComments();
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.range,
      () => {
        calculateDate();
      }
    );

    const calculateDate = () => {
      const currentDate = dayjs();

      let starDate;
      let endDate;

      if (form.range == 'week') {
        starDate = currentDate.clone().startOf('isoWeek').subtract(1, 'day');
        endDate = currentDate.clone().endOf('isoWeek').subtract(2, 'day');

        form.title = `${t('core.time.week')} ${currentDate.isoWeek()}`;
      }

      if (form.range == 'month') {
        starDate = currentDate.clone().startOf('month');
        endDate = currentDate.clone().endOf('month').subtract(1, 'day');

        form.title = `${t('core.time.month')} ${currentDate.month() + 1}`;
      }

      if (starDate && endDate) {
        form.title = form.title.replace(/^\w/, (c) => c.toUpperCase());
        form.starDate = starDate.toISOString().split('T')[0];
        form.endDate = endDate.toISOString().split('T')[0];
      }
      form.periodId = props.planningWeekWithDetail?.periodId ?? 0;
    };

    const editCompetence = async (competenceId: number) => {
      await router.push({
        name: 'administration.homeTeacher.competencies.edit',
        params: {
          courseId: courseId,
          academicPeriodGroupId: academicPeriodGroupId,
          curriculumSubjectId: curriculumSubjectId.value,
          competenceId: competenceId,
        },
        query: {
          planningWeekId: parseInt(route.params.planningWeekId as string, 10),
        },
      });
    };
    const editSession = async (sessionId: number) => {
      await router.push({
        name: 'administration.homeTeacher.attendance.edit',
        params: {
          courseId: courseId,
          sessionId: sessionId,
        },
        query: {
          academicPeriodGroupId: academicPeriodGroupId,
          planningWeekId: parseInt(route.params.planningWeekId as string, 10),
        },
      });
    };
    const editActivity = async (activityId: number) => {
      await router.push({
        name: 'administration.homeTeacher.activities.edit',
        params: {
          courseId: courseId,
          activityId: activityId,
        },
        query: {
          academicPeriodGroupId: academicPeriodGroupId,
          planningWeekId: parseInt(route.params.planningWeekId as string, 10),
        },
      });
    };

    const updateComments = async () => {
      loadingComments.value = true;

      const response = await getPlanningWeeksWithDetailsService.run(parseInt(route.params.planningWeekId as string, 10));
      comments.value = response.comments;

      loadingComments.value = false;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataSend: ICreateOrUpdatePlanningWeeksService = {
        courseId: form.courseId,
        title: form.title ?? '',
        starDate: form.starDate ?? '',
        endDate: form.endDate ?? '',
        range: form.range,
        periodId: form.periodId ?? 0,
      };

      try {
        const response = await createOrUpdatePlanningWeeksService.run(dataSend, props.planningWeekWithDetail?.id);

        if (!props.planningWeekWithDetail) {
          await router.push({
            name: 'administration.homeTeacherPlanningWeeksEdit',
            params: {
              academicPeriodGroupId: academicPeriodGroupId,
              courseId: courseId,
              planningWeekId: response.data.id,
            },
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    const ApproveDisapprovePlanning = async () => {
      if (props.planningWeekWithDetail?.id) {
        await approveOrDisapprovePlanningService.run(props.planningWeekWithDetail.id);

        await router.push({
          name: 'administration.homeTeacherPlanningWeeks',
          params: { academicPeriodGroupId: academicPeriodGroupId },
        });
      }
    };

    const openSelectData = (keyData: 'activities' | 'competencies' | 'sessions') => {
      selectDataKey.value = keyData;
      selectData.value = true;
    };
    const closeSelectData = async () => {
      selectData.value = false;

      if (props.planningWeekWithDetail?.id) {
        const planningWeekWithDetails = await getPlanningWeeksWithDetailsService.run(props.planningWeekWithDetail.id);
        competencies.value = planningWeekWithDetails.competencies;
        activities.value = planningWeekWithDetails.activities;
        sessions.value = planningWeekWithDetails.sessions;

        loadingSessions.value = true;

        const relatedDataSession = await getSessionsRelatedDataFormService.run(courseId);
        const topics: any[] = relatedDataSession.topics;

        if (sessions.value.length) {
          for (let i = 0; i < sessions.value.length; i++) {
            const sessionId = sessions.value[i].id;

            const currentSession = await getSessionByIdService.run(sessionId);

            const topicIds: any[] = currentSession.topicIds;
            const lcTopics: any[] = [];

            for (let j = 0; j < topicIds.length; j++) {
              const currentTopic = topics.filter((item) => item.id == topicIds[j]);
              if (currentTopic.length) lcTopics.push(currentTopic[0]);
            }

            if (lcTopics.length) sessions.value[i].topics = lcTopics;
            else sessions.value[i].topics = [];
          }
        }

        loadingSessions.value = false;
      }
    };

    return {
      loading,
      route,
      v$,
      t,

      curriculumSubjectId,
      loadingSessions,
      loadingComments,
      selectDataKey,
      competencies,
      selectData,
      activities,
      sessions,
      comments,
      level,

      ApproveDisapprovePlanning,
      closeSelectData,
      openSelectData,
      updateComments,
      editCompetence,
      editActivity,
      editSession,
      save,

      dayjs,
      periods,
    };
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}

.disabled {
  pointer-events: none;
}
</style>
