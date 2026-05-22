<template>
  <AppBaseList :title="t('Panel de Coordinación')">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="coordination-panel">
        <!-- Welcome -->
        <div class="coordination-panel__welcome">
          <h2 class="coordination-panel__title">
            {{ t('Panel de Coordinación') }}
          </h2>
          <p class="coordination-panel__subtitle">
            {{ t('Gestione las postulaciones de proyectos de grado y tesis') }}
          </p>
        </div>

        <!-- Summary cards -->
        <div class="coordination-panel__stats">
          <AppStatCard :label="t('Pendientes')" :value="stats.pending" :caption="t('Requieren revisión')" icon="clock" variant="white" />
          <AppStatCard :label="t('Aprobadas')" :value="stats.approved" :caption="t('Postulaciones aprobadas')" icon="check-circle" variant="white" />
          <AppStatCard :label="t('Rechazadas')" :value="stats.rejected" :caption="t('Postulaciones rechazadas')" icon="times-circle" variant="white" />
        </div>

        <!-- Postulations section -->
        <AppCardDashboard class="coordination-panel__list-card">
          <template #title>
            <div class="list-header">
              <h3 class="list-header__title">{{ t('Postulaciones') }}</h3>
              <p class="list-header__subtitle">
                {{ t('Haga clic en una postulación para revisar los detalles') }}
              </p>
            </div>
          </template>

          <template #body>
            <!-- Search + Faculty filter -->
            <div class="list-filters">
              <div class="list-filters__search">
                <AppInput v-model="searchQuery" :placeholder="t('Buscar por nombre o proyecto...')" @input="onSearchInput" />
              </div>
              <div class="list-filters__select">
                <AppSelect v-model="selectedFacultyId" @change="loadList()">
                  <option value="">{{ t('Todas las Facultades') }}</option>
                  <option v-for="faculty in faculties" :key="faculty.id" :value="faculty.id">
                    {{ faculty.name }}
                  </option>
                </AppSelect>
              </div>
            </div>

            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3">
              <li v-for="tab in statusTabs" :key="tab.status" class="nav-item">
                <button type="button" class="nav-link" :class="{ active: activeTab === tab.status }" @click="changeTab(tab.status)">
                  {{ t(tab.label) }}
                </button>
              </li>
            </ul>

            <!-- List -->
            <AppLoading v-if="listLoading" />
            <div v-else-if="postulations.length" class="list-items">
              <PostulationCard v-for="item in postulations" :key="item.id" :postulation="item" @click="openDrawer(item.id)" />
            </div>
            <AppEmptyResponse v-else title="No se encontraron postulaciones" subtitle="Intente ajustar los filtros de búsqueda" :show-image="false" size="xs" />
          </template>
        </AppCardDashboard>
      </div>

      <!-- Postulation detail drawer -->
      <AppDrawer :isVisible="drawerVisible" @update:isVisible="drawerVisible = $event" size="lg">
        <template #head>
          <span class="drawer-title">{{ postulationDetail?.name ?? '' }}</span>
        </template>
        <template #body>
          <AppLoading v-if="drawerLoading" />
          <PostulationDetailDrawer v-else-if="postulationDetail" ref="detailDrawerRef" :detail="postulationDetail" />
        </template>
        <template #footer>
          <div class="detail-footer">
            <template v-if="postulationDetail?.status === 'Pendiente'">
              <AppButton :label="t('Rechazar')" variant="danger" outlined icon="times-circle" @click="handleReject" />
              <AppButton :label="t('Aprobar')" variant="success" icon="check-circle" @click="handleApprove" />
            </template>
            <AppButton v-else :label="t('Cerrar')" variant="primary" outlined icon="times" style="flex: none; margin-left: auto" @click="drawerVisible = false" />
          </div>
        </template>
      </AppDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';

import PostulationCard from '../components/PostulationCard.vue';
import PostulationDetailDrawer from '../components/PostulationDetailDrawer.vue';

import { GetAdminApplicationProjectStatsService } from '../services/getAdminApplicationProjectStats.service';
import { GetAdminApplicationProjectsService } from '../services/getAdminApplicationProjects.service';
import { GetAdminApplicationProjectByIdService } from '../services/getAdminApplicationProjectById.service';
import { UpdateApplicationProjectStatusService } from '../services/updateApplicationProjectStatus.service';
import { GetFacultiesService } from '../services/getFaculties.service';

import type { AdminApplicationProjectListItemDto, AdminApplicationProjectStatsDto, ApplicationProjectDto, ApplicationProjectStatus, FacultyDto } from '../dtos/applicationProject.dto';

type TabStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';

const statusTabs: { label: string; status: TabStatus }[] = [
  { label: 'Pendientes', status: 'Pendiente' },
  { label: 'Aprobadas', status: 'Aprobado' },
  { label: 'Rechazadas', status: 'Rechazado' },
];

export default defineComponent({
  name: 'CoordinationPanel',
  components: {
    AppBaseList,
    AppLoading,
    AppCardDashboard,
    AppDrawer,
    AppButton,
    AppInput,
    AppSelect,
    AppStatCard,
    AppEmptyResponse,
    PostulationCard,
    PostulationDetailDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Panel de Coordinación' });

    const loading = ref(true);
    const listLoading = ref(false);
    const stats = ref<AdminApplicationProjectStatsDto>({
      pending: 0,
      approved: 0,
      rejected: 0,
    });
    const postulations = ref<AdminApplicationProjectListItemDto[]>([]);
    const faculties = ref<FacultyDto[]>([]);

    const activeTab = ref<TabStatus>('Pendiente');
    const searchQuery = ref('');
    const selectedFacultyId = ref<number | string>('');

    const drawerVisible = ref(false);
    const drawerLoading = ref(false);
    const postulationDetail = ref<ApplicationProjectDto | null>(null);
    const detailDrawerRef = ref<InstanceType<typeof PostulationDetailDrawer> | null>(null);

    const loadStats = async () => {
      stats.value = await new GetAdminApplicationProjectStatsService().run();
    };

    const loadList = async () => {
      listLoading.value = true;
      try {
        const result = await new GetAdminApplicationProjectsService().run({
          page: 1,
          perPage: 50,
          status: activeTab.value,
          search: searchQuery.value || undefined,
          facultyId: selectedFacultyId.value || undefined,
          order: 'ASC',
        });
        postulations.value = result.data ?? [];
      } finally {
        listLoading.value = false;
      }
    };

    const loadFaculties = async () => {
      const result = await new GetFacultiesService().run({
        page: 1,
        perPage: 100,
        noPag: 'true',
      });
      faculties.value = Array.isArray(result) ? result : (result as any).data ?? [];
    };

    const changeTab = (status: TabStatus) => {
      activeTab.value = status;
      loadList();
    };

    let searchTimer: ReturnType<typeof setTimeout>;
    const onSearchInput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadList(), 350);
    };

    const openDrawer = async (id: number) => {
      drawerVisible.value = true;
      drawerLoading.value = true;
      postulationDetail.value = null;
      try {
        postulationDetail.value = await new GetAdminApplicationProjectByIdService().run(id);
      } finally {
        drawerLoading.value = false;
      }
    };

    const handleApprove = async () => {
      if (!postulationDetail.value) return;
      const tutorId = detailDrawerRef.value?.getSelectedTutorId?.() ?? null;
      await new UpdateApplicationProjectStatusService().run(postulationDetail.value.id, {
        status: 'Aprobado',
        tutorId: tutorId ?? undefined,
      });
      drawerVisible.value = false;
      postulationDetail.value = null;
      await Promise.all([loadStats(), loadList()]);
    };

    const handleReject = async () => {
      if (!postulationDetail.value) return;
      await new UpdateApplicationProjectStatusService().run(postulationDetail.value.id, { status: 'Rechazado' });
      drawerVisible.value = false;
      postulationDetail.value = null;
      await Promise.all([loadStats(), loadList()]);
    };

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: 'Panel de Coordinación', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      await Promise.all([loadStats(), loadList(), loadFaculties()]);
      loading.value = false;
    });

    return {
      t,
      loading,
      listLoading,
      stats,
      postulations,
      faculties,
      activeTab,
      searchQuery,
      selectedFacultyId,
      statusTabs,
      drawerVisible,
      drawerLoading,
      postulationDetail,
      detailDrawerRef,
      changeTab,
      onSearchInput,
      loadList,
      openDrawer,
      handleApprove,
      handleReject,
    };
  },
});
</script>

<style scoped>
.coordination-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

.coordination-panel__welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coordination-panel__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.coordination-panel__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

.coordination-panel__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .coordination-panel__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .coordination-panel__stats {
    grid-template-columns: 1fr;
  }
}

.coordination-panel__list-card {
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

.list-filters {
  display: flex;
  width: 100%;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.list-filters__search {
  flex: 1;
  max-width: 360px;
  min-width: 180px;
}

.list-filters__select {
  flex-shrink: 0;
  min-width: 180px;
}

.list-filters__select :deep(.o-ctrl-sel) {
  width: 100%;
}

.coordination-panel__list-card :deep(.nav.nav-tabs) {
  width: 100%;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.drawer-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-light);
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.detail-footer :deep(.o-btn) {
  flex: 1;
  justify-content: center;
}
</style>
