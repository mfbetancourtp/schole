<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButtonBack
        :to="{
          name: 'administration.homeTeacher',
        }"
      ></AppButtonBack>
    </template>

    <template v-slot:content>
      <TabsTeacher class="mb-6"></TabsTeacher>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="filter-container mb-6">
          <AppFilter v-model="periodId" filter-name="Periodos" class="period-filter">
            <label for="periodName" class="text-sm font-medium mb-1 block">Periodos</label>
            <v-select :reduce="reduceLevel" :options="periods" input-id="periodId" v-model="periodId" class="period-select" label="name"> </v-select>
          </AppFilter>
        </div>

        <AppLoading v-if="loadingPlanningWeek"></AppLoading>

        <div v-else class="planning-weeks-container">
          <AppCard v-for="(planningWeek, index) in planningWeeks" :key="index" class="planning-week-card">
            <template #title>
              <h3 class="planning-week-title">{{ planningWeek.name }}</h3>
            </template>
            <template #body>
              <AppLoading v-if="loadingComments"></AppLoading>

              <div v-if="!loadingComments" :class="{ 'grid-cards': planningWeek.planningWeeks.length }">
                <AppCheckPermission permission="classroom.planningWeeks.create">
                  <div class="new-planning-container">
                    <AppButtonNewContainer @click="create(planningWeek.id, 'Crear Planeador de Clases')" class=""></AppButtonNewContainer>
                  </div>
                </AppCheckPermission>

                <AppEmptyResponse v-if="!planningWeek.planningWeeks.length" :show-image="true" class="empty-response"></AppEmptyResponse>

                <AppCard v-for="(item, index) in planningWeek.planningWeeks" :key="index" class="planning-item-card">
                  <template #body>
                    <div class="status-indicator">
                      <AppIcon v-if="item.isApproved == 1" class="text-success" icon="check-circle" v-tooltip="'Aprobado'"></AppIcon>
                      <AppIcon v-else-if="item.isApproved == 0" class="text-danger" icon="times-circle" v-tooltip="'No Aprobado'"></AppIcon>
                      <AppIcon v-else-if="item.isApproved == null" icon="minus-circle" v-tooltip="'Pendiente'"></AppIcon>
                    </div>

                    <h5 class="item-title">{{ item.title }}</h5>
                    <p class="item-date">
                      {{ dayjs(item.starDate).format('D MMM') }} -
                      {{ dayjs(item.endDate).format('D MMM') }}
                    </p>

                    <div class="item-details">
                      <div class="detail-item">
                        <span class="detail-label">Periodo:</span>
                        <span class="detail-badge">{{ item.periodName }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Desempeño:</span>
                        <span class="detail-text">
                          {{ item.learningOutcomeDescription || 'Sin desempeño' }}
                        </span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Actividades:</span>
                        <span class="detail-badge">{{ item.numberActivities }}</span>
                      </div>
                    </div>
                  </template>

                  <template #footer>
                    <div class="card-actions">
                      <AppButtonGroup>
                        <AppButton icon="cloud-download-alt" @click="getReport(item.id)" v-tooltip="'Descargar Reporte'"></AppButton>
                        <ButtonDrawerChat
                          :showChatDrawer="showChatDrawer"
                          :number-comments="`${item.numberComments == 0 ? '' : item.numberComments}`"
                          :loadingComments="loadingPlanningWeek"
                          :comments="planningWeekWithDetails?.comments"
                          :planningWeekWithDetails="planningWeekWithDetails"
                          @update:isVisible="(val) => (showChatDrawer = val)"
                          @click="openChatDrawer(item)"
                          @update-comments="updateComments(item.id)"
                        />

                        <AppButtonEdit @click="edit(planningWeek.id, item.id, 'Editar Planeador')"></AppButtonEdit>

                        <AppButtonDelete @click="openModalDelete(item.id)"></AppButtonDelete>
                      </AppButtonGroup>
                    </div>
                  </template>
                </AppCard>
                <AppModal v-model="modalDelete">
                  <AppConfirmDeleteModal v-if="modalDelete" entity="Planeador" @confirmDelete="deletePlaningWeeks"> </AppConfirmDeleteModal>
                </AppModal>
              </div>
            </template>
          </AppCard>
          <!-- Componente Drawer -->
          <PlanningWeeksDrawer
            :nameDrawer="selectedParams.nameDrawer"
            v-model:visible="drawerVisible"
            :academicPeriodGroupId="academicPeriodGroupId"
            :courseId="selectedParams.courseId"
            :planningWeekId="selectedParams.planningWeekId || undefined"
            :planningWeekWithDetail="planningWeekWithDetails"
            @reload-data="reloadData"
          />
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import ButtonDrawerChat from './ButtonDrawerChat.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
// import AppButtonChat from '../../../shared/components/Buttons/AppButtonChat.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import { useHeaderStore } from '../../../stores/header.store';
import TabsTeacher from '../components/TabsTeacher.vue';
import PlanningWeeksDrawer from '../components/PlanningWeeksDrawer.vue';

import { HomeTeacherCoursesDto } from '../dtos/homeTeacherCourses.dto';
import { PlanningWeekDto } from '../dtos/planningWeek.dto';
import { RelatedDataDto } from '../dtos/planningWeek.dto';

import { GetActiveCoursesService } from '../services/getActiveCourses.service';
import { GetPlanningWeeksByDateService } from '../services/getPlanningWeeksByDate.service';
import { GetPlanningWeeksWithDetailsService } from '../services/getPlanningWeeksWithDetails.service';

import { GetRelatedDataPlanningWeeksService } from '../services/getRelatedDataPlanningWeeks.service';
import { GetPeriodsPlanningsWeeksService } from '../services/getPeriodsPlanningWeeks.service';
import { DeletePlanningWeeksService } from '../services/deletePlanningWeeks.service';

import { GetSessionByIdService } from '../services/getSessionById.service';
import { GetSessionsRelatedDataFormService } from '../services/getSessionsRelatedDataForm.service';
import { GetPlanningWeekReportService } from '../services/getPlanningWeekReport.service';

const getRelatedDataPlanningWeeksService = new GetRelatedDataPlanningWeeksService();
const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const getPlanningWeeksByDateService = new GetPlanningWeeksByDateService();
const getActiveCoursesService = new GetActiveCoursesService();
const getPeriodsPlanningWeeksService = new GetPeriodsPlanningsWeeksService();
const deletePlanningWeeksService = new DeletePlanningWeeksService();

const getSessionsRelatedDataFormService = new GetSessionsRelatedDataFormService();
const getSessionByIdService = new GetSessionByIdService();
const getPlanningWeekReportService = new GetPlanningWeekReportService();

interface Level {
  id: number;
  name: string;
}

export default defineComponent({
  name: 'PlanningWeeks',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    PlanningWeeksDrawer,
    AppCheckPermission,
    AppEmptyResponse,
    ButtonDrawerChat,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    // AppButtonChat,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppIcon,
    AppCard,
    TabsTeacher,
    AppFilter,
  },

  setup(props, { emit }) {
    const { t } = useI18n();

    const route = useRoute();
    const router = useRouter();
    const titleAux = 'Diario de campo';
    const courseId = parseInt(route.params.courseId.toString(), 10);
    const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId.toString(), 10);

    const modalDelete = ref(false);
    const PlaningWeekId = ref();
    const showChatDrawer = ref(false);

    useMeta({ title: t(titleAux) });
    const routes = [
      {
        name: 'core.menu.home-teacher',
        url: { name: 'administration.homeTeacher' },
      },
      {
        name: titleAux,
      },
    ];

    // Declaramos el ref para controlar la visibilidad del Drawer
    const drawerVisible = ref(false);
    // Declaramos el objeto para almacenar los parámetros seleccionados
    const selectedParams = reactive({
      academicPeriodGroupId: Number(/* Asigna aquí el valor correspondiente */),
      courseId: 0,
      planningWeekId: null,
      planningWeekWithDetail: [],
      nameDrawer: '',
    });

    const planningWeeks: Ref<PlanningWeekDto[]> = ref([]);
    const title: Ref<string> = ref('');

    const periods: Ref<any[]> = ref([]);
    const periodId: Ref<number | null> = ref(null);

    const relatedData: Ref<RelatedDataDto | null> = ref(null);

    const planningWeekWithDetails: Ref<any | null> = ref([null]);

    const planningWeeksReport: Ref<any | null> = ref(null);

    const loadingPlanningWeek = ref(false);
    const loadingComments = ref(false);
    const loading = ref(true);

    const comments: { value: any } = reactive({
      value: {},
    });

    // Función para abrir el Drawer
    const edit = (courseId: number, planningWeekId: any, nameDrawer: string) => {
      selectedParams.nameDrawer = nameDrawer;
      selectedParams.courseId = courseId;
      selectedParams.planningWeekId = planningWeekId;
      drawerVisible.value = true;
      getEditData(planningWeekId);
    };

    const getEditData = async (planningWeekId: number) => {
      loadingPlanningWeek.value = true;
      try {
        planningWeekWithDetails.value = await getPlanningWeeksWithDetailsService.run(planningWeekId);
        const relatedDataSession = await getSessionsRelatedDataFormService.run(courseId);
        localStorage.setItem('planningWeekId', planningWeekWithDetails?.value?.id);
        relatedData.value = await getRelatedDataPlanningWeeksService.run({
          courseId: courseId,
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
      loadingPlanningWeek.value = false;
    };

    const getReport = async (planningWeekId: number) => {
      loadingPlanningWeek.value = true;
      try {
        const response = await getPlanningWeekReportService.run(planningWeekId);

        if (response?.url) {
          // Abrir la URL en una nueva pestaña
          window.open(response.url, '_blank');
        } else {
          console.error('No se encontró una URL en la respuesta del servicio.');
        }
      } catch (e) {
        console.error('Error obteniendo el reporte:', e);
      }
      loadingPlanningWeek.value = false;
    };

    onMounted(async () => {
      localStorage.setItem('courseIdPW', courseId as any);
      await getData();

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

      await getData();

      loading.value = false;
    });

    watch(periodId, async () => {
      localStorage.setItem('periodId', JSON.stringify(periodId.value));
      await getData();
    });

    const getData = async () => {
      loadingPlanningWeek.value = true;
      try {
        let response;
        if (periodId.value === 0 || periodId.value === null) {
          response = await getPlanningWeeksByDateService.run(academicPeriodGroupId, {});
        } else {
          response = await getPlanningWeeksByDateService.run(academicPeriodGroupId, { periodId: periodId.value });
        }

        planningWeeks.value = response.filter((item: any) => item.id === courseId);

        const titleHeader = planningWeeks.value;
        titleHeader.forEach((item: any) => (title.value = `Planeador de Clase "${item.name}`));
      } catch (e) {
        console.log(e);
      }

      loadingPlanningWeek.value = false;
    };

    const create = async (courseId: number, nameDrawer: string) => {
      selectedParams.nameDrawer = nameDrawer;
      selectedParams.courseId = courseId;
      selectedParams.planningWeekId = null;
      planningWeekWithDetails.value = null; // Limpia la data del modo edición
      drawerVisible.value = true;
    };

    const updateComments = async (planningWeekId: any = null) => {
      loadingComments.value = true;

      const data = planningWeeks.value.filter((item) => item.id == planningWeekId)[0];

      await data?.planningWeeks.forEach(async (planningWeek) => {
        const response = await getPlanningWeeksWithDetailsService.run(planningWeek.id);
        comments.value[`planningWeek_${planningWeek.id}`] = response.comments;
      });

      getData();

      setInterval(async () => {
        loadingComments.value = false;
      }, 1000);
    };

    const openModalDelete = (PlaningWeek: number) => {
      modalDelete.value = true;
      PlaningWeekId.value = PlaningWeek;
    };

    const deletePlaningWeeks = async () => {
      try {
        loading.value = true;

        await deletePlanningWeeksService.run(PlaningWeekId.value);

        modalDelete.value = false;

        await getData();
      } catch (e) {
        console.log(e);
      } finally {
        loading.value = false;
      }
    };

    // Función tipada para el `reduce`
    const reduceLevel = (level: Level) => level.id;

    const openChatDrawer = async (item: any) => {
      loadingComments.value = true;
      planningWeekWithDetails.value = await getPlanningWeeksWithDetailsService.run(item.id);
      showChatDrawer.value = true;
      loadingComments.value = false;
    };

    const closeChatDrawer = () => {
      showChatDrawer.value = false;
    };

    const reloadData = () => {
      emit('reload-data');
      getData();
    };

    return {
      loading,
      routes,
      title,
      t,

      academicPeriodGroupId,
      loadingPlanningWeek,
      loadingComments,
      planningWeeks,
      comments,
      modalDelete,

      updateComments,
      create,
      openModalDelete,
      deletePlaningWeeks,

      dayjs,
      periods,
      periodId,

      drawerVisible,
      selectedParams,
      edit,
      reduceLevel,
      planningWeekWithDetails,
      reloadData,
      showChatDrawer,
      closeChatDrawer,
      openChatDrawer,
      getReport,
    };
  },
});
</script>

<style scoped>
/* Base grid layout */
.grid-cards {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

/* Filter container */
.filter-container {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.period-filter {
  width: 100%;
  max-width: 300px;
  border-radius: 0.5rem;
  padding: 0.75rem;
}

/* Planning week cards */
.planning-weeks-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.planning-week-card {
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: none;
}

.planning-week-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.planning-week-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  padding: 0.5rem 0;
  border-bottom: 2px solid #f0f4f8;
  margin-bottom: 1rem;
}

/* Planning item cards */
.planning-item-card {
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f4f8;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.planning-item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

/* Status indicator */
.status-indicator {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

/* Item title and date */
.item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}

.item-date {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

/* Item details */
.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f4f8;
}

.detail-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
}

.detail-badge {
  background-color: var(--color-primary);
  color: var(--color-light);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.detail-text {
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
}

/* Card actions */
.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* New planning button container */
.new-planning-container {
  background-color: #f8fafc;
  border-radius: 1.5rem;
  /* border: 1px dashed #cbd5e1; */
}

.new-planning-container:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

/* Empty response */
.empty-response {
  grid-column: 1 / -1;
  padding: 2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cards {
    grid-template-columns: 1fr;
  }

  .period-filter {
    max-width: 100%;
  }
}
</style>
