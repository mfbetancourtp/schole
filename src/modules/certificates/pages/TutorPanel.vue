<template>
  <AppBaseList :title="t('Panel del Tutor')">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="tutor-panel">
        <div class="tutor-panel__welcome">
          <h2 class="tutor-panel__title">{{ t('Panel del Tutor') }}</h2>
          <p class="tutor-panel__subtitle">
            {{ t('Gestiona todos los proyectos de grado que diriges') }}
          </p>
        </div>

        <div class="tutor-panel__stats">
          <AppStatCard :label="t('Total')" :value="summary.total" :caption="t('Hitos encontrados')" icon="file-alt" variant="white" />
          <AppStatCard :label="t('Pendiente')" :value="summary.pending" :caption="t('Sin iniciar')" icon="exclamation-circle" variant="white" />
          <AppStatCard :label="t('En Progreso')" :value="summary.inProgress" :caption="t('En desarrollo')" icon="clock" variant="white" />
          <AppStatCard :label="t('En Revisión')" :value="summary.inReview" :caption="t('Requiere revisión')" icon="eye" variant="white" />
          <AppStatCard :label="t('Completado')" :value="summary.completed" :caption="t('Finalizados')" icon="check-circle" variant="white" />
        </div>

        <div class="tutor-panel__filters">
          <AppInput v-model="searchQuery" :placeholder="t('Buscar por proyecto o hito...')" class="tutor-panel__search" />
          <AppSelect v-model="statusFilter" class="tutor-panel__select">
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ t(opt.label) }}
            </option>
          </AppSelect>
        </div>

        <div class="tutor-panel__projects">
          <TutorMilestoneCard v-for="row in filteredRows" :key="row.id" :milestone="row" :students="studentsForMilestone(row)" @review="openReviewDrawer" />
        </div>

        <AppEmptyResponse v-if="filteredRows.length === 0" title="No se encontraron hitos" subtitle="Intente ajustar los filtros de búsqueda" :show-image="false" size="xs" />
      </div>

      <AppDrawer :isVisible="drawerVisible" @update:isVisible="drawerVisible = $event" size="lg">
        <template #head>
          <span class="drawer-title">{{ reviewDetail?.title ?? '' }}</span>
        </template>
        <template #body>
          <AppLoading v-if="drawerLoading" />
          <ProjectReviewDrawer v-else-if="reviewDetail" ref="reviewDrawerRef" :detail="reviewDetail" />
        </template>
        <template #footer>
          <div v-if="reviewDetail" class="review-footer">
            <AppButton :label="t('Solicitar Correcciones')" variant="warning" outlined icon="undo" @click="handleAction('request_corrections')" />
            <AppButton :label="t('Aprobar Hito')" variant="success" icon="thumbs-up" @click="handleAction('approve')" />
          </div>
        </template>
      </AppDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';
import InstitutionsStore from '../../../shared/stores/institutions.store';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import type { InstitutionDto } from '../../../shared/dto/institution.dto';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import { ToastService } from '../../../shared/services/toast.service';

import { tutorPanelService } from '../services/tutorPanel.service';
import { GetApplicationProjectsMilestonesDocumentsService } from '../services/getApplicationProjectsMilestonesDocuments.service';
import { CreateOrUpdateApplicationProjectsMilestonesReviewsService } from '../services/createOrUpdateApplicationProjectsMilestonesReviews.service';
import TutorMilestoneCard from '../components/TutorMilestoneCard.vue';
import ProjectReviewDrawer from '../components/ProjectReviewDrawer.vue';
import type {
  TutorPanelMilestoneDto,
  TutorPanelMilestoneStatus,
  StudentInfo,
  ProjectReviewDetail,
  PendingDelivery,
  CreateOrUpdateApplicationProjectsMilestonesReviewDto,
} from '../dtos/tutorPanel.dto';

export default defineComponent({
  name: 'TutorPanel',
  components: {
    AppBaseList,
    AppLoading,
    AppDrawer,
    AppButton,
    AppInput,
    AppSelect,
    AppStatCard,
    AppEmptyResponse,
    TutorMilestoneCard,
    ProjectReviewDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Panel del Tutor' });

    const loading = ref(true);
    const rows = ref<TutorPanelMilestoneDto[]>([]);
    const searchQuery = ref('');
    const statusFilter = ref<TutorPanelMilestoneStatus | ''>('');

    const drawerVisible = ref(false);
    const drawerLoading = ref(false);
    const reviewDetail = ref<ProjectReviewDetail | null>(null);
    const reviewDrawerRef = ref<InstanceType<typeof ProjectReviewDrawer> | null>(null);
    const selectedMilestoneId = ref<number | null>(null);

    const institutionId = computed<number | null>(() => InstitutionsStore.state.selectedInstitution?.id ?? null);
    const getApplicationProjectsMilestonesDocumentsService = new GetApplicationProjectsMilestonesDocumentsService();
    const createOrUpdateApplicationProjectsMilestonesReviewsService = new CreateOrUpdateApplicationProjectsMilestonesReviewsService();
    const toastService = new ToastService();

    const statusOptions = computed(() => [
      { label: '--', value: '' },
      { label: 'Pendiente', value: 'Pendiente' },
      { label: 'En Progreso', value: 'En Progreso' },
      { label: 'En Revisión', value: 'En Revisión' },
      { label: 'Completado', value: 'Completado' },
    ]);

    const normalizeStatus = (value: unknown) => {
      const normalized = String(value ?? '').toLowerCase();
      if (normalized.includes('pendien')) return 'Pendiente';
      if (normalized.includes('progres')) return 'En Progreso';
      if (normalized.includes('revisi') || normalized.includes('revis')) return 'En Revisión';
      if (normalized.includes('complet')) return 'Completado';
      return String(value ?? '');
    };

    const summary = computed(() => {
      const counts = {
        total: rows.value.length,
        pending: 0,
        inProgress: 0,
        inReview: 0,
        completed: 0,
      };
      for (const row of rows.value) {
        const s = normalizeStatus(row.status);
        if (s === 'Pendiente') counts.pending += 1;
        else if (s === 'En Progreso') counts.inProgress += 1;
        else if (s === 'En Revisión') counts.inReview += 1;
        else if (s === 'Completado') counts.completed += 1;
      }
      return counts;
    });

    const filteredRows = computed(() => {
      const query = searchQuery.value.toLowerCase().trim();
      if (!query) return rows.value;
      return rows.value.filter((row) => {
        const projectName = row.applicationProject?.name?.toLowerCase() ?? '';
        const milestoneName = row.scheduleSettingsMilestone?.name?.toLowerCase() ?? '';
        return projectName.includes(query) || milestoneName.includes(query);
      });
    });

    const studentsForMilestone = (milestone: TutorPanelMilestoneDto): StudentInfo[] => milestone.students ?? [];

    const studentsStringForMilestone = (milestone: TutorPanelMilestoneDto) => {
      const students = studentsForMilestone(milestone)
        .map((s) => s.name)
        .filter(Boolean);
      if (students.length === 0) return '';
      if (students.length === 1) return students[0];
      if (students.length === 2) return `${students[0]} y ${students[1]}`;
      return `${students.slice(0, -1).join(', ')} y ${students[students.length - 1]}`;
    };

    const teamSizeFromApplicationType = (applicationType?: string) => {
      const normalized = String(applicationType ?? '').toLowerCase();
      if (normalized.includes('pareja') || normalized.includes('equipo')) return 2;
      return 1;
    };

    const openReviewDrawer = async (milestone: TutorPanelMilestoneDto) => {
      drawerVisible.value = true;
      drawerLoading.value = true;
      selectedMilestoneId.value = milestone.id;

      const title = milestone.applicationProject?.name ?? '';
      const currentChapter = milestone.scheduleSettingsMilestone?.name ?? '';
      const progressRaw = Number(milestone.scheduleSettingsMilestone?.approvalDeadline ?? 0);
      const progress = Number.isFinite(progressRaw) ? Math.max(0, Math.min(100, progressRaw)) : 0;

      reviewDetail.value = {
        projectId: milestone.applicationProject?.id ?? 0,
        title,
        students: studentsStringForMilestone(milestone),
        modality: milestone.applicationProject?.scheduleSettingsName ?? '',
        progress,
        currentChapter,
        teamSize: teamSizeFromApplicationType(milestone.applicationProject?.applicationType),
        deliveries: [],
      };

      try {
        const deliveries = await getApplicationProjectsMilestonesDocumentsService.run({
          applicationProjectsMilestonesId: milestone.id,
        });

        if (reviewDetail.value) {
          reviewDetail.value = {
            ...reviewDetail.value,
            deliveries: deliveries as PendingDelivery[],
          };
        }
      } finally {
        drawerLoading.value = false;
      }
    };

    const handleAction = async (action: 'approve' | 'request_corrections') => {
      if (!selectedMilestoneId.value) return;

      const feedbackRaw = reviewDrawerRef.value?.getFeedback?.() ?? '';
      const feedback = String(feedbackRaw).trim();

      if (action === 'request_corrections' && !feedback) {
        toastService.show('La retroalimentación es requerida para solicitar correcciones', 'danger');
        return;
      }

      const payload: CreateOrUpdateApplicationProjectsMilestonesReviewDto = {
        applicationProjectsMilestonesId: selectedMilestoneId.value,
        status: action === 'request_corrections' ? 'Corrección' : 'Completado',
        feedback: action === 'approve' ? (feedback ? feedback : null) : feedback,
      };

      drawerLoading.value = true;
      try {
        await createOrUpdateApplicationProjectsMilestonesReviewsService.run(payload);
        toastService.show('Acción realizada correctamente', 'success');
        drawerVisible.value = false;
        reviewDetail.value = null;
        selectedMilestoneId.value = null;
        await loadData();
      } finally {
        drawerLoading.value = false;
      }
    };

    const ensureSelectedInstitution = () => {
      if (InstitutionsStore.state.selectedInstitution) return;

      const institutionsService = new InstitutionsService();
      const selected = institutionsService.getSelectedInstitution();
      if (selected) {
        InstitutionsStore.methods.setSelectedInstitution(selected);
        return;
      }

      const institutions = institutionsService.getInstitutions() as InstitutionDto[];
      if (institutions.length > 0) {
        InstitutionsStore.methods.setSelectedInstitution(institutions[0]);
      }
    };

    const loadData = async () => {
      loading.value = true;
      try {
        if (!institutionId.value) {
          rows.value = [];
          return;
        }
        rows.value = await tutorPanelService.getMilestoneCards({
          institutionId: institutionId.value,
          status: statusFilter.value || undefined,
        });
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: 'Panel del Tutor', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      ensureSelectedInstitution();
      loadData();
    });

    watch([institutionId, statusFilter], () => {
      loadData();
    });

    return {
      t,
      loading,
      rows,
      searchQuery,
      statusFilter,
      statusOptions,
      summary,
      filteredRows,
      studentsForMilestone,
      drawerVisible,
      drawerLoading,
      reviewDetail,
      reviewDrawerRef,
      openReviewDrawer,
      handleAction,
    };
  },
});
</script>

<style scoped>
.tutor-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

/* Welcome */
.tutor-panel__welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tutor-panel__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.tutor-panel__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

/* Stats */
.tutor-panel__stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .tutor-panel__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .tutor-panel__stats {
    grid-template-columns: 1fr;
  }
}

/* Filters */
.tutor-panel__filters {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tutor-panel__search {
  flex: 1;
  min-width: 180px;
}

.tutor-panel__select {
  width: 220px;
  flex-shrink: 0;
}

/* Projects grid */
.tutor-panel__projects {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.drawer-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-light);
}

.review-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.review-footer :deep(.o-btn) {
  flex: 1;
  justify-content: center;
}

.tutor-panel__card-title {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #212b36;
  line-height: 1.3;
}

.tutor-panel__card-line {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tutor-panel__card-label {
  font-weight: 600;
  color: #637381;
}

.tutor-panel__card-value {
  color: #212b36;
}

.tutor-panel__card-desc {
  color: #637381;
  font-size: 12px;
  line-height: 1.4;
}

.tutor-panel__card-footer {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

@media (max-width: 1200px) {
  .tutor-panel__projects {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .tutor-panel__projects {
    grid-template-columns: 1fr;
  }
}
</style>
