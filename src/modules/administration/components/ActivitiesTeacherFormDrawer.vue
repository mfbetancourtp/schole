<template>
  <AppLoading v-if="loading"></AppLoading>
  <div v-else class="activities-drawer">
    <!-- Sección de Actividades -->
    <section class="activities-section">
      <div class="section-header">
        <AppCheckPermission permission="classroom.planningWeeks.edit">
          <div class="action-buttons">
            <!-- Botón para selección -->
            <AppButton :disabled="planningWeekWithDetails?.isApproved ? true : false" label="Seleccionar Actividades" @click="openSelectData('activities')" outlined class="select-btn" />
            <!-- Botón para agregar actividad: abre el Drawer -->
            <AppButton :disabled="planningWeekWithDetails?.isApproved ? true : false" label="Agregar Actividad" @click="handleAddActivity" class="add-btn" />

            <AppButton class="add-btn" @click="showChatDrawer = true">
              <AppIcon icon="comments" />
              <span class="chat-text"> Chat</span>
              <span v-if="planningWeekWithDetails?.comments && planningWeekWithDetails.comments.length > 0" class="chat-badge">
                {{ planningWeekWithDetails.comments.length }}
              </span>
            </AppButton>
          </div>
        </AppCheckPermission>
      </div>

      <!-- Lista de actividades -->
      <div class="activities-list">
        <AppEmptyResponse v-if="!activities.length" />
        <div v-else class="activity-cards">
          <div v-for="(item, index) in activities" :key="index" class="activity-card" :class="{ approved: planningWeekWithDetails?.isApproved }">
            <div class="activity-content">
              <div class="activity-header">
                <h6 class="activity-name">{{ item.name }}</h6>
                <div class="activity-status">
                  <span v-if="item.isPublish" class="status-badge published">Publicado</span>
                  <span v-else class="status-badge unpublished">No Publicado</span>
                </div>
              </div>

              <div class="activity-details">
                <span class="activity-dates">
                  <i class="fas fa-calendar-alt date-icon"></i>
                  {{ formatActivityDates(item) }}
                </span>

                <AppButtonGroup>
                  <AppButtonEdit @click="handleEditActivity(item)"></AppButtonEdit>
                  <AppButtonDelete class="delete-button" @click="openModalDelete(item.id)"></AppButtonDelete>
                </AppButtonGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sección de Chat -->
    <ChatDrawer
      v-model:isVisible="showChatDrawer"
      :loadingComments="loadingComments"
      :comments="planningWeekWithDetails?.comments"
      :planningWeekWithDetails="planningWeekWithDetails"
      :is-small-view="true"
      @update-comments="updateComments"
    />

    <!-- Modal de selección -->
    <AppModal v-model="selectData" size="sm">
      <template v-if="selectData && planningWeekWithDetails?.id">
        <SelectCompetenciesActivitiesSessions :key-data="selectDataKey" :planning-week-id="planningWeekWithDetails.id" @close="closeSelectData" />
      </template>
    </AppModal>

    <AppModal v-model="modalDelete" size="sm">
      <AppConfirmDeleteModal v-if="modalDelete" entity="Actividad" @confirmDelete="unlinkActivities"> </AppConfirmDeleteModal>
    </AppModal>

    <!-- Drawer para agregar/editar actividad -->
    <ActivityDrawer
      v-model:is-visible="showActivityDrawer"
      :title="activityDrawerTitle"
      :subtitle="activityDrawerSubtitle"
      :routes="activityDrawerRoutes"
      :competencies-by-period="competenciesByPeriod"
      :activity="selectedActivity"
      :level="level"
      :loading-p="loading"
      @saved="onActivitySaved"
      @reload-data="reloadData"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, PropType, Ref, ref } from 'vue';
import dayjs from 'dayjs';
import { LevelDto } from '../dtos/level.dto';
import { PlanningWeekWithDetailDto } from '../dtos/planningWeek.dto';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import SelectCompetenciesActivitiesSessions from './SelectCompetenciesActivitiesSessions.vue';
// import ActivitiesTeacherDrawerForm from './ActivitiesTeacherDrawerForm.vue';
import ActivityDrawer from './ActivityDrawer.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import ChatDrawer from './ChatDrawer.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';

import { GetPlanningWeeksWithDetailsService } from '../services/getPlanningWeeksWithDetails.service';
import { GetCourseByIdService } from '../services/getCourseById.service';
import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';
import { GetListCompetencesService } from '../services/getListCompetences.service';
import { GetActivitiesRelatedDataFormService } from '../services/getActivitiesRelatedDataForm.service';
import { GetActivityByIdService } from '../services/getActivityById.service';
import { GetActiveCoursesService } from '../services/getActiveCourses.service';
import { GetSubjectAssignmentsService } from '../../academicPlanning/services/getSubjectAssignments.service';
import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';
import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';
import { GetSessionByIdService } from '../services/getSessionById.service';
import { UnlinkActivitiesService } from '../services/unlinnkActivities.service';

const getActivitiesRelatedDataFormService = new GetActivitiesRelatedDataFormService();
const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getListCompetencesService = new GetListCompetencesService();
const getCourseByIdService = new GetCourseByIdService();
const getActivityByIdService = new GetActivityByIdService();
const getSubjectAssignmentsService = new GetSubjectAssignmentsService();
const getActiveCoursesService = new GetActiveCoursesService();

const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();
const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();
const getSessionByIdService = new GetSessionByIdService();

const unlinkActivitiesService = new UnlinkActivitiesService();

export default defineComponent({
  name: 'ActivitiesTeacherFormDrawer',
  components: {
    AppLoading,
    AppButton,
    AppIcon,
    AppEmptyResponse,
    ChatDrawer,
    AppModal,
    SelectCompetenciesActivitiesSessions,
    // ActivitiesTeacherDrawerForm,
    ActivityDrawer,
    AppCheckPermission,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonDelete,
    AppConfirmDeleteModal,
  },
  props: {
    planningWeekWithDetail: {
      type: Object as PropType<any | null>,
      default: null,
    },
    comments: { type: Array, default: () => [] },
  },
  emits: ['refreshActivities', 'updateComments', 'reload-data'],
  setup(props, { emit }) {
    // Modal de selección
    const selectData = ref(false);
    const selectDataKey: Ref<'activities' | 'competencies' | 'sessions'> = ref('activities');

    // Nueva propiedad para controlar la visibilidad del ChatDrawer
    const showChatDrawer = ref(false);

    const modalDelete = ref(false);
    const ActivityId = ref();

    const loading = ref(false);
    const loadingComments = ref(false);

    // Drawer para agregar/editar actividad
    const showActivityDrawer = ref(false);
    const activityDrawerTitle = ref('');
    const activityDrawerSubtitle = ref('');
    const activityDrawerRoutes = ref([]);
    const selectedActivity = ref<any>(null);

    const level: Ref<LevelDto | null> = ref(null);
    const competenciesByPeriod: Ref<any[]> = ref([]);

    const planningWeekWithDetails: Ref<any | null> = ref(null);
    const relatedData: Ref<any | null> = ref(null);

    // Se maneja internamente la lista de actividades (eliminamos la prop "activities")
    const activities = computed(() => planningWeekWithDetails.value?.activities || []);

    const fetchData = async (planningWeekId: number) => {
      loading.value = true;
      const courseIdPW = localStorage.getItem('courseIdPW');
      const planningWeekIdLS = localStorage.getItem('planningWeekId');
      try {
        planningWeekWithDetails.value = await getPlanningWeeksWithDetailsService.run(planningWeekId ?? planningWeekIdLS);
        const relatedDataSession = await getSessionsRelatedDataFormService.run(courseIdPW ?? planningWeekWithDetails?.value?.id);
        relatedData.value = await getRelatedDataPlanningWeeksService.run({
          courseId: planningWeekWithDetails?.value?.id as any,
        });

        const topics: any[] = relatedDataSession.topics;

        if (planningWeekWithDetails.value && planningWeekWithDetails.value.sessions.length) {
          for (let i = 0; i < planningWeekWithDetails.value.sessions.length; i++) {
            const sessionId = planningWeekWithDetails.value.sessions[i].id;
            const currentSession = await getSessionByIdService.run(sessionId);
            const topicIds: any[] = currentSession.topicIds;
            const lcTopics: any[] = [];

            for (let j = 0; j < topicIds.length; j++) {
              const currentTopic = topics.filter((item) => item.id == topicIds[j]);

              if (currentTopic.length) lcTopics.push(currentTopic[0]);
            }

            if (lcTopics.length) planningWeekWithDetails.value.sessions[i].topics = lcTopics;
            else planningWeekWithDetails.value.sessions[i].topics = [];
          }
        }
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    };

    onMounted(async () => {
      try {
        const planningWeekId = localStorage.getItem('planningWeekId');
        await fetchData((props?.planningWeekWithDetail?.id as any) ?? planningWeekId);
      } catch (error) {
        console.error('Error', error);
      }
    });

    const reloadData = () => {
      emit('reload-data');
      const planningWeekId = localStorage.getItem('planningWeekId');
      fetchData((props?.planningWeekWithDetail?.id as any) ?? planningWeekId);
    };

    onMounted(async () => {
      try {
        let courses: any[] = await getActiveCoursesService.run({});
        let academicPeriodGroupId: number | null = null;
        let subjectAssignmentId: number | null = null;
        let curriculumSubjectId: number | null = null;

        for (let i = 0; i < courses.length; i++) {
          let currentData: any = courses[i];
          for (let j = 0; j < currentData.courses.length; j++) {
            let currentCourse: any = currentData.courses[j];
            if (currentCourse.id == planningWeekWithDetails?.value?.courseId) {
              academicPeriodGroupId = currentData.id;
              subjectAssignmentId = currentCourse.subjectAssignmentId;
              break;
            }
          }
          if (academicPeriodGroupId) break;
        }

        if (academicPeriodGroupId) {
          let resp = await getSubjectAssignmentsService.run(academicPeriodGroupId);
          resp.forEach((subjectAssignment: any) => {
            if (subjectAssignment.id === subjectAssignmentId) {
              curriculumSubjectId = subjectAssignment.curriculumSubjectId;
            }
          });
        }

        const courseIdPW = localStorage.getItem('courseIdPW');
        const curriculumSubjectIdLS = localStorage.getItem('curriculumSubjectIdLS');
        const response = await getActivitiesRelatedDataFormService.run(planningWeekWithDetails?.value?.courseId ?? (courseIdPW as any));

        level.value = await getLevelByCourseIdService.run(planningWeekWithDetails?.value?.courseId as number);

        // Cargar competencias con resultados de aprendizaje y temas por periodo
        const learningOutcomes: any[] = response.learningOutcomes;
        const periods: any[] = response.periods;
        const topics: any[] = response.topics;

        for (let i = 0; i < periods.length; i++) {
          const periodId = periods[i].id;
          const competences = await getListCompetencesService.run(planningWeekWithDetails?.value?.competency?.curriculumSubjectId || curriculumSubjectId || curriculumSubjectIdLS, periodId);
          const currentCompetences: any[] = competences.filter((item: any) => item.periodId == periodId);
          let competenceWithLearningOutcomesAndTopics: any[] = [];

          for (let j = 0; j < currentCompetences.length; j++) {
            const competencyId = currentCompetences[j].id;
            const currentLearningOutcomes: any[] = learningOutcomes.filter((item: any) => item.competencyId == competencyId);
            const currentTopics: any[] = topics.filter((item: any) => item.competencyId == competencyId);
            competenceWithLearningOutcomesAndTopics.push({
              id: competencyId,
              name: currentCompetences[j].description,
              learningOutcomes: currentLearningOutcomes,
              topics: currentTopics,
            });
          }

          competenciesByPeriod.value.push({
            periodId,
            competences: competenceWithLearningOutcomesAndTopics,
          });
        }
      } catch (e) {
        console.error(e);
      }
    });

    // Función para cargar datos completos de la actividad a editar
    const loadActivityEditData = async (activityId: number, courseId: number) => {
      loading.value = true;
      const curriculumSubjectIdLS = localStorage.getItem('curriculumSubjectIdLS');
      try {
        const courses = await getActiveCoursesService.run({});
        const courseData = courses.find((data: any) => data.courses.some((course: any) => course.id === courseId));
        if (courseData) {
          const currentCourse = courseData.courses.find((course: any) => course.id === courseId);
          const academicPeriodGroupId = courseData.id;
          const subjectAssignmentId = currentCourse.subjectAssignmentId;
          const resp = academicPeriodGroupId ? await getSubjectAssignmentsService.run(academicPeriodGroupId) : [];
          const subjectAssignment = resp.find((assignment: any) => assignment.id === subjectAssignmentId);
          const curriculumSubjectId = subjectAssignment ? subjectAssignment.curriculumSubjectId : null;

          const [activityData, competences, levelData, course] = await Promise.all([
            getActivityByIdService.run(activityId),
            curriculumSubjectId
              ? getListCompetencesService.run(planningWeekWithDetails?.value?.competency?.curriculumSubjectId || curriculumSubjectId || curriculumSubjectIdLS, courseId)
              : Promise.resolve([]),
            getLevelByCourseIdService.run(courseId),
            getCourseByIdService.run(courseId),
          ]);

          // Asignar datos obtenidos
          selectedActivity.value = activityData;
          level.value = levelData;
          activityDrawerSubtitle.value = course.name;

          // Obtener y procesar datos relacionados con resultados de aprendizaje
          const responseData = await getActivitiesRelatedDataFormService.run(courseId, activityId);
          const learningOutcomes = responseData.learningOutcomes;
          const periods = responseData.periods;
          const topics = responseData.topics;
          competenciesByPeriod.value = periods.map((period: any) => {
            const periodCompetences = competences.filter((competence: any) => competence.periodId === period.id);
            const competenceWithLearningOutcomesAndTopics = periodCompetences.map((competency: any) => {
              const currentLearningOutcomes = learningOutcomes.filter((outcome: any) => outcome.competencyId === competency.id);
              const currentTopics = topics.filter((topic: any) => topic.competencyId === competency.id);
              return {
                id: competency.id,
                name: competency.description,
                learningOutcomes: currentLearningOutcomes,
                topics: currentTopics,
              };
            });
            return {
              periodId: period.id,
              competences: competenceWithLearningOutcomesAndTopics,
            };
          });
        }
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    };

    // Función para abrir el modal de selección
    const openSelectData = (key: 'activities' | 'competencies' | 'sessions') => {
      selectDataKey.value = key;
      selectData.value = true;
    };

    const closeSelectData = () => {
      selectData.value = false;
      fetchData(props?.planningWeekWithDetail?.id as any);
    };

    // Helper para formatear fechas
    const formatActivityDates = (activity: any) => {
      return `${dayjs(activity.dateSince).format('D MMM')} - ${dayjs(activity.dateUntil).format('D MMM')}`;
    };

    // Función para abrir el Drawer en modo agregar actividad
    const handleAddActivity = () => {
      activityDrawerTitle.value = 'Agregar Actividad';
      activityDrawerSubtitle.value = planningWeekWithDetails.value ? `Diario de campo ${planningWeekWithDetails.value.title}` : '';
      activityDrawerRoutes.value = [];
      selectedActivity.value = null;
      showActivityDrawer.value = true;
    };

    // Función para abrir el Drawer en modo editar actividad
    const handleEditActivity = async (activity: any) => {
      activityDrawerTitle.value = 'Editar Actividad';
      activityDrawerSubtitle.value = planningWeekWithDetails.value ? `Diario de campo ${planningWeekWithDetails.value.title}` : '';
      activityDrawerRoutes.value = [];
      await loadActivityEditData(activity.id, planningWeekWithDetails?.value.courseId as number);
      nextTick(() => {
        showActivityDrawer.value = true;
      });
    };

    const openModalDelete = (Activity: number) => {
      modalDelete.value = true;
      ActivityId.value = Activity;
    };

    const unlinkActivities = async () => {
      try {
        loading.value = true;

        await unlinkActivitiesService.run(ActivityId.value);

        modalDelete.value = false;

        await fetchData(planningWeekWithDetails?.value?.id as any);
      } catch (e) {
        console.log(e);
      } finally {
        loading.value = false;
      }
    };

    // Cuando se guarda (creación o edición), se cierra el Drawer y se notifica al padre
    const onActivitySaved = () => {
      showActivityDrawer.value = false;
      emit('refreshActivities');
    };

    // Propagar actualización de comentarios al padre
    const updateComments = () => {
      emit('updateComments');
      const planningWeekId = localStorage.getItem('planningWeekId');
      fetchData((planningWeekWithDetails?.value?.id as any) ?? planningWeekId);
    };

    return {
      selectData,
      selectDataKey,
      openSelectData,
      closeSelectData,
      loadingComments,
      showActivityDrawer,
      activityDrawerTitle,
      activityDrawerSubtitle,
      activityDrawerRoutes,
      selectedActivity,
      handleAddActivity,
      handleEditActivity,
      formatActivityDates,
      onActivitySaved,
      showChatDrawer,
      updateComments,
      competenciesByPeriod,
      level,
      activities,
      loading,
      planningWeekWithDetails,
      reloadData,
      modalDelete,
      openModalDelete,
      unlinkActivities,
    };
  },
});
</script>

<style scoped>
/* Estilos generales del drawer */
.activities-drawer {
  background-color: var(--color-light);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Sección de actividades */
.activities-section {
  background-color: var(--color-light-2);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(var(--color-dark-rgb), var(--opacity-color-10));
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 635px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  margin: 0;
  font-weight: 600;
  color: var(--color-gray-900);
  font-size: 1.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.select-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.add-btn {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-light);
  font-weight: 500;
}

/* Lista de actividades */
.activities-list {
  margin-top: 1rem;
}

.activity-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-card {
  background-color: var(--color-light);
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(var(--color-dark-rgb), var(--opacity-color-10));
  transition: all 0.2s ease;
}

.activity-card:hover {
  box-shadow: 0 3px 6px rgba(var(--color-dark-rgb), var(--opacity-color-20));
  transform: translateY(-2px);
}

.activity-card.approved {
  opacity: 0.8;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.activity-name {
  margin: 0;
  font-weight: 600;
  color: var(--color-gray-900);
  font-size: 1rem;
}

.activity-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-dates {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-icon {
  color: var(--color-primary);
  font-size: 0.875rem;
}

.edit-button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.edit-button:hover {
  background-color: rgba(var(--color-primary-rgb), var(--opacity-color-10));
}

.edit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estilos para los badges de estado */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.published {
  background-color: var(--color-primary);
  color: var(--color-dark);
}

.status-badge.unpublished {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

/* Sección de chat */
.chat-section {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-start;
}

.chat-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-primary);
  color: var(--color-dark);
  border: none;
  border-radius: 50px;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(var(--color-dark-rgb), var(--opacity-color-20));
}

.chat-button:hover {
  background-color: rgba(var(--color-primary-rgb), var(--opacity-color-90));
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(var(--color-dark-rgb), var(--opacity-color-20));
}

.chat-icon {
  font-size: 1rem;
}

.chat-text {
  font-size: 0.9rem;
  color: var(--color-light);
}

.chat-badge {
  position: absolute;
  top: -1px;
  right: -25px;
  background-color: var(--color-danger);
  color: var(--color-light);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(var(--color-dark-rgb), var(--opacity-color-20));
}

.delete-button {
  color: var(--color-danger);
}
</style>
