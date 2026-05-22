<template>
  <AppBaseList :title="t('Postulaciones')">
    <template #actions>
      <AppButton :label="t('Crear Postulación')" variant="primary" icon="plus" style="color: white" @click="goToCreate" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="postulation-list">
        <div v-if="postulations.length" class="postulation-list__grid">
          <div v-for="item in postulations" :key="item.id" class="pcard">
            <!-- Colored header (same pattern as ModalityTemplateCard) -->
            <div
              class="pcard__header"
              :style="{
                backgroundColor: headerBg(item.scheduleSettings.color),
              }"
            >
              <div
                class="pcard__icon-wrap"
                :style="{
                  backgroundColor: iconBg(item.scheduleSettings.color),
                  color: item.scheduleSettings.color,
                }"
              >
                <AppIcon :icon="item.scheduleSettings.icon" />
              </div>
              <div class="pcard__header-text">
                <h3 class="pcard__name" :style="{ color: item.scheduleSettings.color }">
                  {{ item.name }}
                </h3>
                <p class="pcard__description">{{ item.description }}</p>
              </div>
            </div>

            <!-- White body -->
            <div class="pcard__body">
              <div class="pcard__meta-row">
                <AppBadge :label="item.status" :variant="statusVariant(item.status)" />
                <span
                  class="pcard__modality-badge"
                  :style="{
                    backgroundColor: iconBg(item.scheduleSettings.color),
                    color: item.scheduleSettings.color,
                  }"
                >
                  {{ item.scheduleSettings.name }}
                </span>
              </div>

              <div class="pcard__meta">
                <div class="pcard__meta-item">
                  <AppIcon icon="university" />
                  <span>{{ item.faculty.name }}</span>
                </div>
                <div class="pcard__meta-item">
                  <AppIcon icon="user" />
                  <span>{{ item.user.people.names }} {{ item.user.people.lastnames }}</span>
                </div>
                <div v-if="item.members.length" class="pcard__meta-item">
                  <AppIcon icon="users" />
                  <span>{{ item.members.map((m) => `${m.user.people.names} ${m.user.people.lastnames}`).join(', ') }}</span>
                </div>
                <div class="pcard__meta-item">
                  <AppIcon icon="calendar-alt" />
                  <span>{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>

              <div class="pcard__actions">
                <AppButton v-if="item.status === 'Aprobado'" :label="t('Ver Seguimiento')" variant="primary" icon="chart-line" @click="goToTracking(item.id)" />
                <AppButton v-if="item.status === 'Pendiente'" :label="t('Solicitar Cancelación')" variant="danger" outlined icon="times-circle" @click="openCancelConfirm(item)" />
              </div>
            </div>
          </div>
        </div>

        <AppEmptyResponse v-else title="Sin postulaciones" subtitle="Aún no has creado ninguna postulación de proyecto" :show-image="false" size="xs" />
      </div>

      <!-- Cancel confirm modal -->
      <AppModal v-model="cancelModalOpen">
        <AppConfirmDeleteModal v-if="cancelModalOpen" :entity="postulationToCancel?.name ?? ''" @confirmDelete="handleCancelPostulation" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';
import AuthenticatedUserStore from '../../../shared/stores/authenticatedUser.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { GetApplicationProjectsService } from '../services/getApplicationProjects.service';
import { DeleteApplicationProjectService } from '../services/deleteApplicationProject.service';
import type { ApplicationProjectDto, ApplicationProjectStatus } from '../dtos/applicationProject.dto';

function hexToRgba(hex: string, alpha: number): string {
  const c = (hex || '#1b55e2').replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) || 27;
  const g = parseInt(c.slice(2, 4), 16) || 85;
  const b = parseInt(c.slice(4, 6), 16) || 226;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default defineComponent({
  name: 'ProjectPostulationList',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppBadge,
    AppIcon,
    AppEmptyResponse,
    AppModal,
    AppConfirmDeleteModal,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    useMeta({ title: 'Postulaciones' });

    const loading = ref(true);
    const postulations = ref<ApplicationProjectDto[]>([]);
    const cancelModalOpen = ref(false);
    const postulationToCancel = ref<ApplicationProjectDto | null>(null);

    const headerBg = (color: string) => hexToRgba(color, 0.07);
    const iconBg = (color: string) => hexToRgba(color, 0.12);

    const statusVariant = (status: ApplicationProjectStatus): string => {
      const map: Record<ApplicationProjectStatus, string> = {
        Pendiente: 'warning',
        Aprobado: 'success',
        Rechazado: 'danger',
        Cancelado: 'secondary',
      };
      return map[status] ?? 'secondary';
    };

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('es', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const goToCreate = () => router.push({ name: 'certificates.projectPostulationCreate' });

    const goToTracking = (id: number) => router.push({ name: 'certificates.progressTracking', params: { id } });

    const openCancelConfirm = (item: ApplicationProjectDto) => {
      postulationToCancel.value = item;
      cancelModalOpen.value = true;
    };

    const handleCancelPostulation = async () => {
      if (!postulationToCancel.value) return;
      await new DeleteApplicationProjectService().run(postulationToCancel.value.id);
      cancelModalOpen.value = false;
      postulationToCancel.value = null;
      await loadData();
    };

    const loadData = async () => {
      loading.value = true;
      try {
        const userId = AuthenticatedUserStore.state.user?.id;
        const data = await new GetApplicationProjectsService().run({
          page: 1,
          perPage: 20,
          userId,
        });
        postulations.value = Array.isArray(data) ? data : (data as any).data ?? [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: 'Postulaciones', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadData();
    });

    return {
      t,
      loading,
      postulations,
      cancelModalOpen,
      postulationToCancel,
      headerBg,
      iconBg,
      statusVariant,
      formatDate,
      goToCreate,
      goToTracking,
      openCancelConfirm,
      handleCancelPostulation,
    };
  },
});
</script>

<style scoped>
.postulation-list {
  padding: 8px 0;
}

.postulation-list__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 20px;
  row-gap: 20px;
}

@media (max-width: 900px) {
  .postulation-list__grid {
    grid-template-columns: 1fr;
  }
}

/* Card with subgrid for equal header heights */
.postulation-list__grid {
  grid-auto-rows: auto;
}

.pcard {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 2;
  row-gap: 0;
  overflow: hidden;
  min-width: 0;
}

.pcard__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(145, 158, 171, 0.16);
}

.pcard__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.pcard__header-text {
  min-width: 0;
}

.pcard__name {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.pcard__description {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #637381;
  margin: 3px 0 0 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pcard__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
}

.pcard__meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pcard__modality-badge {
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

.pcard__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pcard__meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

.pcard__meta-item :deep(.app-icon),
.pcard__meta-item :deep(svg),
.pcard__meta-item :deep(i) {
  width: 14px;
  color: #919eab;
  flex-shrink: 0;
}

.pcard__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 4px;
  border-top: 1px solid #f4f6f8;
  margin-top: auto;
}
</style>
