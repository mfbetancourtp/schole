<template>
  <AppBaseList title="Postulaciones a Becas">
    <template #actions>
      <AppButton variant="light" nativeType="button" @click="exportData" :disabled="isExporting">
        <AppIcon :icon="isExporting ? 'circle-notch' : 'download'" :class="{ 'pa-btn-spin': isExporting }" class="pa-btn-icon-left" />
        {{ isExporting ? 'Exportando…' : 'Exportar' }}
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <!-- Page header -->
        <div class="pa-header">
          <h1 class="pa-header__title">Postulaciones a Becas</h1>
          <p class="pa-header__subtitle">Administración y seguimiento de solicitudes</p>
        </div>

        <!-- Stats cards -->
        <div class="pa-stats-row">
          <div class="pa-stat-card">
            <p class="pa-stat-card__label">Total Solicitudes</p>
            <p class="pa-stat-card__value pa-stat-card__value--blue">
              {{ stats.total }}
            </p>
          </div>
          <div class="pa-stat-card">
            <p class="pa-stat-card__label">Pendientes</p>
            <p class="pa-stat-card__value pa-stat-card__value--blue">
              {{ stats.pendientes }}
            </p>
          </div>
          <div class="pa-stat-card">
            <p class="pa-stat-card__label">Adjudicadas</p>
            <p class="pa-stat-card__value pa-stat-card__value--green">
              {{ stats.adjudicadas }}
            </p>
          </div>
          <div class="pa-stat-card">
            <p class="pa-stat-card__label">Rechazadas</p>
            <p class="pa-stat-card__value pa-stat-card__value--red">
              {{ stats.rechazadas }}
            </p>
          </div>
        </div>

        <!-- Datatable -->
        <AppDatatable name="admin-scholarship-applications" :data="filteredApplications" :paginated="true">
          <template #filters>
            <AppFilter v-model="statusId" filter-name="scholarshipApplicationsAdmin.statusId">
              <AppFormField label="Estado">
                <AppAutocomplete v-model="statusId" :options="statusOptions" input-id="statusId" />
              </AppFormField>
            </AppFilter>
            <AppFilter v-model="scholarshipSettingsId" filter-name="scholarshipApplicationsAdmin.scholarshipSettingsId">
              <AppFormField label="Beca">
                <AppAutocomplete v-model="scholarshipSettingsId" :options="scholarshipOptions" input-id="scholarshipSettingsId" />
              </AppFormField>
            </AppFilter>
          </template>

          <AppDatatableColumn label="ID" field="displayId" width="60" v-slot="{ row }">
            <span class="pa-id">{{ row.displayId }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Estudiante" field="studentName" sortable v-slot="{ row }">
            {{ row.studentName }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Código" field="studentCode" v-slot="{ row }">
            <span class="pa-code">{{ row.studentCode }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Beca" field="scholarshipName" v-slot="{ row }">
            <span class="pa-beca-name">{{ row.scholarshipName }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Fecha" field="date" sortable v-slot="{ row }">
            {{ row.date }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Estado" field="statusName" v-slot="{ row }">
            <span
              class="pa-status-badge"
              :style="{
                background: `${row.statusColor}18`,
                color: row.statusColor,
                borderColor: row.statusColor,
              }"
            >
              <AppIcon :icon="statusMeta(row.statusKey).icon" class="pa-status-badge__icon" />
              {{ row.statusName }}
            </span>
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" label="core.actions">
            <AppButtonGroup>
              <AppButton icon="eye" nativeType="button" v-tooltip="'Revisar solicitud'" :disabled="row.statusKey === 'rechazada'" @click.stop="onViewReview(row)" />
              <AppButton icon="trash" nativeType="button" v-tooltip="'Rechazar solicitud'" :disabled="row.statusKey === 'rechazada' || row.statusKey === 'adjudicada'" @click.stop="onCancel(row)" />
            </AppButtonGroup>
          </AppDatatableColumn>
        </AppDatatable>
      </template>
    </template>
  </AppBaseList>

  <!-- Review Drawer -->
  <AdminApplicationReview v-if="selectedRawItem" :isVisible="showReviewModal" :application="selectedRawItem" @update:isVisible="onReviewClose" />

  <!-- Reject modal -->
  <AppModal v-model="showCancelModal" size="md">
    <RejectApplicationModal v-if="showCancelModal && cancelTarget" :application="cancelTarget" @confirmed="onConfirmCancel" />
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';
import { ToastService } from '../../../shared/services/toast.service';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import RejectApplicationModal from '../components/RejectApplicationModal.vue';
import AdminApplicationReview from '../components/AdminApplicationReview.vue';

import { GetScholarshipApplicationsAdminService } from '../services/getScholarshipApplicationsAdmin.service';
import { GetScholarshipApplicationsStatsService } from '../services/getScholarshipApplicationsStats.service';
import { GetScholarshipSettingsService } from '../services/getScholarshipSettings.service';
import { GetScholarshipStatusesService } from '../services/getScholarshipStatuses.service';
import type { AdminApplicationListItemDto, ScholarshipApplicationsStatsItemDto, DisplayApplicationDto } from '../dtos/adminApplications.dto';

const listService = new GetScholarshipApplicationsAdminService();
const statsService = new GetScholarshipApplicationsStatsService();
const settingsService = new GetScholarshipSettingsService();
const statusesService = new GetScholarshipStatusesService();

const STATUS_META: Record<string, { label: string; icon: string }> = {
  borrador: { label: 'Borrador', icon: 'pencil-alt' },
  pendiente: { label: 'Pendiente', icon: 'clock' },
  subsanacion: { label: 'En Subsanación', icon: 'exclamation-triangle' },
  evaluada: { label: 'Evaluada', icon: 'search' },
  adjudicada: { label: 'Adjudicada', icon: 'check-circle' },
  rechazada: { label: 'Rechazada', icon: 'times-circle' },
};

function normalizeStatusKey(raw?: string): string {
  const s = (raw ?? '').toLowerCase().replace(/\s+/g, '');
  if (s.includes('borrador')) return 'borrador';
  if (s.includes('subsana')) return 'subsanacion';
  if (s.includes('adjudic')) return 'adjudicada';
  if (s.includes('rechaz')) return 'rechazada';
  if (s.includes('evalua')) return 'evaluada';
  return 'pendiente';
}

function mapToDisplay(item: AdminApplicationListItemDto): DisplayApplicationDto {
  return {
    id: item.id,
    displayId: `#${String(item.id).padStart(3, '0')}`,
    studentName: [item.people?.names, item.people?.lastnames].filter(Boolean).join(' ') || '—',
    studentCode: item.scholarshipSettings?.code ?? item.people?.studentCode ?? '—',
    scholarshipName: item.scholarshipSettings?.name ?? '—',
    scholarshipSettingsId: item.scholarshipSettings?.id ?? 0,
    statusId: item.scholarshipStatus?.id ?? 0,
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-ES') : '—',
    statusKey: normalizeStatusKey(item.scholarshipStatus?.name),
    statusCode: item.scholarshipStatus?.code ?? '',
    statusName: item.scholarshipStatus?.name ?? '—',
    statusColor: item.scholarshipStatus?.color ?? '#2563eb',
  };
}

export default defineComponent({
  name: 'ScholarshipApplicationsAdmin',
  components: {
    AppBaseList,
    AppLoading,
    AppIcon,
    AppButton,
    AppButtonGroup,
    AppModal,
    AppDatatable,
    AppDatatableColumn,
    AppFilter,
    AppFormField,
    AppAutocomplete,
    RejectApplicationModal,
    AdminApplicationReview,
  },

  setup() {
    useMeta({ title: 'Postulaciones a Becas' });
    const toast = new ToastService();

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Bienestar Estudiantil', url: '' };
    headerStore.moduleItem = { name: 'Postulaciones a Becas', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const isLoading = ref(true);
    const isExporting = ref(false);
    const rawItems = ref<AdminApplicationListItemDto[]>([]);
    const applications = ref<DisplayApplicationDto[]>([]);
    const statsRaw = ref<ScholarshipApplicationsStatsItemDto[]>([]);
    const statusOptions = ref<{ id: number; name: string }[]>([]);
    const scholarshipOptions = ref<{ id: number; name: string }[]>([]);

    const statusId = ref<number | null>(null);
    const scholarshipSettingsId = ref<number | null>(null);

    const showReviewModal = ref(false);
    const selectedRawItem = ref<AdminApplicationListItemDto | null>(null);
    const showCancelModal = ref(false);
    const cancelTarget = ref<DisplayApplicationDto | null>(null);

    const loadData = async () => {
      isLoading.value = true;
      try {
        const [listRes, statsRes, settingsRes, statusesRes] = await Promise.allSettled([
          listService.run({ noPag: 'true' }),
          statsService.run(),
          settingsService.run({ noPag: 'true' }),
          statusesService.run(),
        ]);

        if (listRes.status === 'fulfilled') {
          const items: AdminApplicationListItemDto[] = Array.isArray(listRes.value) ? listRes.value : listRes.value?.data ?? [];
          rawItems.value = items;
          applications.value = items.map(mapToDisplay);
        }

        if (statsRes.status === 'fulfilled') {
          statsRaw.value = Array.isArray(statsRes.value) ? statsRes.value : [];
        }

        if (settingsRes.status === 'fulfilled') {
          const data = Array.isArray(settingsRes.value) ? settingsRes.value : settingsRes.value?.data ?? [];
          scholarshipOptions.value = data.map((s: any) => ({
            id: s.id,
            name: s.name ?? '—',
          }));
        }

        if (statusesRes.status === 'fulfilled') {
          const data = Array.isArray(statusesRes.value) ? statusesRes.value : statusesRes.value?.data ?? [];
          statusOptions.value = data.map((s: any) => ({
            id: s.id,
            name: s.name ?? '—',
          }));
        }
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(async () => {
      const localFilters = JSON.parse(localStorage.getItem('filters') ?? '{}');
      if (localFilters['scholarshipApplicationsAdmin.statusId']) {
        statusId.value = Number(localFilters['scholarshipApplicationsAdmin.statusId']);
      }
      if (localFilters['scholarshipApplicationsAdmin.scholarshipSettingsId']) {
        scholarshipSettingsId.value = Number(localFilters['scholarshipApplicationsAdmin.scholarshipSettingsId']);
      }
      await loadData();
    });

    const filteredApplications = computed(() => {
      let list = applications.value;
      if (statusId.value) list = list.filter((a) => a.statusId === statusId.value);
      if (scholarshipSettingsId.value) list = list.filter((a) => a.scholarshipSettingsId === scholarshipSettingsId.value);
      return list;
    });

    const stats = computed(() => {
      if (statsRaw.value.length > 0) {
        const find = (keywords: string[]) => {
          const item = statsRaw.value.find((s) => keywords.some((k) => (s.name ?? s.status ?? '').toLowerCase().includes(k)));
          return item?.count ?? 0;
        };
        return {
          total: statsRaw.value.reduce((sum, s) => sum + (s.count ?? 0), 0),
          pendientes: find(['pendiente', 'revisión', 'revi']),
          adjudicadas: find(['adjudic']),
          rechazadas: find(['rechaz']),
        };
      }
      return {
        total: applications.value.length,
        pendientes: applications.value.filter((a) => a.statusKey === 'pendiente').length,
        adjudicadas: applications.value.filter((a) => a.statusKey === 'adjudicada').length,
        rechazadas: applications.value.filter((a) => a.statusKey === 'rechazada').length,
      };
    });

    const statusMeta = (key: string) => STATUS_META[key] ?? { label: key, icon: 'circle' };

    const onViewReview = (app: DisplayApplicationDto) => {
      selectedRawItem.value = rawItems.value.find((r) => r.id === app.id) ?? null;
      showReviewModal.value = true;
    };

    const onReviewClose = (val: boolean) => {
      showReviewModal.value = val;
      if (!val) loadData();
    };

    const onCancel = (app: DisplayApplicationDto) => {
      cancelTarget.value = app;
      showCancelModal.value = true;
    };

    const onConfirmCancel = () => {
      showCancelModal.value = false;
      cancelTarget.value = null;
      loadData();
    };

    const exportData = () => {
      isExporting.value = true;
      setTimeout(() => {
        const headers = ['ID', 'Estudiante', 'Código', 'Beca', 'Fecha', 'Estado'];
        const rows = applications.value.map((a) => [a.displayId, a.studentName, a.studentCode, a.scholarshipName, a.date, a.statusName].map((v) => `"${v}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `postulaciones_becas_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        isExporting.value = false;
        toast.show('Exportación completada correctamente', 'success');
      }, 800);
    };

    return {
      isLoading,
      isExporting,
      filteredApplications,
      stats,
      statusId,
      scholarshipSettingsId,
      statusOptions,
      scholarshipOptions,
      statusMeta,
      showReviewModal,
      selectedRawItem,
      showCancelModal,
      cancelTarget,
      onViewReview,
      onReviewClose,
      onCancel,
      onConfirmCancel,
      exportData,
    };
  },
});
</script>

<style scoped>
.pa-header {
  margin-bottom: 16px;
}
.pa-header__title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}
.pa-header__subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.pa-stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.pa-stat-card {
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 18px;
}
.pa-stat-card__label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}
.pa-stat-card__value {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}
.pa-stat-card__value--blue {
  color: #2563eb;
}
.pa-stat-card__value--green {
  color: #16a34a;
}
.pa-stat-card__value--red {
  color: #dc2626;
}

.pa-id {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}
.pa-code {
  font-size: 12px;
  color: #64748b;
}
.pa-beca-name {
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
}

.pa-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid;
}
.pa-status-badge__icon {
  font-size: 10px;
}

.pa-btn-icon-left {
  margin-right: 4px;
  font-size: 13px;
}
.pa-btn-spin {
  animation: pa-spin 0.8s linear infinite;
}
@keyframes pa-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.o-modal .o-modal__content) {
  max-height: 95vh !important;
  overflow: hidden !important;
  display: flex;
  flex-direction: column;
  margin: auto;
}
:deep(.o-modal .o-modal-content) {
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
