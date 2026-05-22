<template>
  <AppBaseList :title="t('Asignación de Jurados')">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="jury-panel">
        <!-- Welcome -->
        <div class="jury-panel__welcome">
          <h2 class="jury-panel__title">{{ t('Asignación de Jurados') }}</h2>
          <p class="jury-panel__subtitle">
            {{ t('Vincule docentes evaluadores a los proyectos de grado') }}
          </p>
        </div>

        <!-- Summary cards -->
        <div class="jury-panel__stats">
          <AppStatCard :label="t('Completos')" :value="data.summary.complete" :caption="t('Jurados asignados')" icon="users" variant="white" />
          <AppStatCard :label="t('Parciales')" :value="data.summary.partial" :caption="t('Asignación incompleta')" icon="user-friends" variant="white" />
          <AppStatCard :label="t('Sin Asignar')" :value="data.summary.unassigned" :caption="t('Requieren jurado')" icon="user-slash" variant="white" />
        </div>

        <!-- Projects section -->
        <AppCardDashboard class="jury-panel__list-card">
          <template #title>
            <div class="list-header">
              <h3 class="list-header__title">{{ t('Proyectos') }}</h3>
              <p class="list-header__subtitle">
                {{ t('Haga clic en un proyecto para asignar o modificar el jurado') }}
              </p>
            </div>
          </template>

          <template #body>
            <!-- Search -->
            <div class="list-filters">
              <div class="list-filters__search">
                <AppInput v-model="searchQuery" :placeholder="t('Buscar por proyecto o estudiante...')" />
              </div>
            </div>

            <!-- Project cards -->
            <div class="list-items">
              <JuryProjectCard v-for="project in filteredProjects" :key="project.id" :project="project" @assign="openAssignDrawer" />
            </div>

            <!-- Empty state -->
            <AppEmptyResponse v-if="filteredProjects.length === 0" title="No se encontraron proyectos" subtitle="Intente ajustar la búsqueda" :show-image="false" size="xs" />
          </template>
        </AppCardDashboard>
      </div>

      <!-- Assign Jury drawer -->
      <AppDrawer :isVisible="drawerVisible" @update:isVisible="drawerVisible = $event" size="lg">
        <template #head>
          <div class="drawer-head">
            <span class="drawer-head__title">Asignar Jurado</span>
            <span v-if="projectDetail" class="drawer-head__subtitle">
              {{ projectDetail.title }}
            </span>
          </div>
        </template>
        <template #body>
          <AppLoading v-if="drawerLoading" />
          <div v-else-if="projectDetail" class="drawer-body-inner">
            <JuryAssignmentDrawer ref="assignDrawerRef" :detail="projectDetail" :evaluators="evaluatorOptions" />
          </div>
        </template>
        <template #footer>
          <div v-if="projectDetail" class="drawer-footer">
            <AppButton class="drawer-footer__save" :label="t('Guardar Asignación')" variant="primary" @click="handleSaveAssignment" />
            <AppButton class="drawer-footer__cancel" :label="t('Cancelar')" variant="secondary" outlined @click="drawerVisible = false" />
          </div>
        </template>
      </AppDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

// Shared components
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';

// Module components
import JuryProjectCard from '../components/JuryProjectCard.vue';
import JuryAssignmentDrawer from '../components/JuryAssignmentDrawer.vue';

// Services & types
import { juryAssignmentService } from '../services/juryAssignment.service';
import type { JuryAssignmentPanelData, JuryProjectListItem, JuryProjectDetail, EvaluatorOption } from '../dtos/juryAssignment.dto';

export default defineComponent({
  name: 'JuryAssignment',
  components: {
    AppBaseList,
    AppLoading,
    AppCardDashboard,
    AppDrawer,
    AppButton,
    AppInput,
    AppStatCard,
    AppEmptyResponse,
    JuryProjectCard,
    JuryAssignmentDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Asignación de Jurados' });

    const loading = ref(true);
    const data = ref<JuryAssignmentPanelData>({
      summary: { complete: 0, partial: 0, unassigned: 0 },
      projects: [],
    });
    const searchQuery = ref('');

    // Drawer state
    const drawerVisible = ref(false);
    const drawerLoading = ref(false);
    const projectDetail = ref<JuryProjectDetail | null>(null);
    const evaluatorOptions = ref<EvaluatorOption[]>([]);
    const assignDrawerRef = ref<InstanceType<typeof JuryAssignmentDrawer> | null>(null);

    const filteredProjects = computed(() => {
      const query = searchQuery.value.toLowerCase().trim();
      if (!query) return data.value.projects;
      return data.value.projects.filter((p) => p.title.toLowerCase().includes(query) || p.studentName.toLowerCase().includes(query));
    });

    const openAssignDrawer = async (project: JuryProjectListItem) => {
      drawerVisible.value = true;
      drawerLoading.value = true;
      const [detail, evaluators] = await Promise.all([juryAssignmentService.getProjectDetail(project.id), juryAssignmentService.getEvaluatorOptions()]);
      projectDetail.value = detail;
      evaluatorOptions.value = evaluators;
      drawerLoading.value = false;
    };

    const handleSaveAssignment = async () => {
      if (!projectDetail.value) return;
      const selected = (assignDrawerRef.value as any)?.getSelectedEvaluators?.() ?? [];
      await juryAssignmentService.saveAssignment(projectDetail.value.id, selected);
      drawerVisible.value = false;
      projectDetail.value = null;
      await loadData();
    };

    const loadData = async () => {
      loading.value = true;
      try {
        data.value = await juryAssignmentService.getPanelData();
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: 'Asignación de Jurados', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadData();
    });

    return {
      t,
      loading,
      data,
      searchQuery,
      filteredProjects,
      drawerVisible,
      drawerLoading,
      projectDetail,
      evaluatorOptions,
      assignDrawerRef,
      openAssignDrawer,
      handleSaveAssignment,
    };
  },
});
</script>

<style scoped>
.jury-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

/* Welcome */
.jury-panel__welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.jury-panel__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.jury-panel__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

/* Stats */
.jury-panel__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .jury-panel__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .jury-panel__stats {
    grid-template-columns: 1fr;
  }
}

/* List card */
.jury-panel__list-card {
  width: 100%;
  box-sizing: border-box;
}

.list-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.list-header__title {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.list-header__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 0;
}

/* Filters */
.list-filters {
  display: flex;
  width: 100%;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.list-filters__search {
  max-width: 400px;
  min-width: 180px;
  flex: 1;
}

/* List items */
.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Drawer head */
.drawer-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-head__title {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-light);
}

.drawer-head__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* Drawer footer */
.drawer-footer {
  display: flex;
  gap: 12px;
  width: 100%;
}

.drawer-footer__save {
  background-color: var(--color-primary);
  color: var(--color-light);
}

.drawer-footer__cancel {
  background-color: var(--color-light);
  color: var(--color-dark);
}

.drawer-footer :deep(.o-btn:first-child) {
  flex: 1;
}

.drawer-footer :deep(.o-btn:last-child) {
  flex: 1;
}

.drawer-body-inner {
  padding: 16px 0;
}
</style>
