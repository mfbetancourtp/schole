<template>
  <AppBaseList title="Mis Solicitudes">
    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <!-- Header -->
        <div class="ma-header">
          <h1 class="ma-header__title">Mis Solicitudes</h1>
          <p class="ma-header__subtitle">Seguimiento del estado de tus postulaciones a becas</p>
        </div>

        <!-- Application Cards -->
        <div v-if="applications.length > 0" class="ma-list">
          <div v-for="app in applications" :key="app.id" class="ma-card" :class="{ 'ma-card--new': app.isNew }">
            <!-- Card Header -->
            <div class="ma-card__head">
              <div>
                <h3 class="ma-card__name">{{ app.scholarshipName }}</h3>
                <p class="ma-card__date">Fecha de postulación: {{ app.submittedDate }}</p>
              </div>
              <span class="ma-status-badge" :class="`ma-status-badge--${app.status}`">
                <AppIcon :icon="statusMeta(app.status).icon" class="ma-status-badge__icon" />
                {{ statusMeta(app.status).label }}
              </span>
            </div>

            <!-- Horizontal Timeline -->
            <div class="ma-timeline">
              <template v-for="(step, i) in getStepsForStatus(app.status)" :key="step.key">
                <div
                  class="ma-tl-step"
                  :class="{
                    'ma-tl-step--done': i < app.currentStep,
                    'ma-tl-step--active': i === app.currentStep && app.status !== 'rechazada',
                    'ma-tl-step--rejected': app.status === 'rechazada' && i === app.currentStep,
                  }"
                >
                  <div class="ma-tl-dot">
                    <AppIcon v-if="i < app.currentStep" icon="check" class="ma-tl-dot__check" />
                    <AppIcon v-else-if="app.status === 'rechazada' && i === app.currentStep" icon="times" class="ma-tl-dot__check" />
                  </div>
                  <span class="ma-tl-label">{{ step.label }}</span>
                </div>
                <div v-if="i < getStepsForStatus(app.status).length - 1" class="ma-tl-line" :class="{ 'ma-tl-line--done': i < app.currentStep }"></div>
              </template>
            </div>

            <!-- Card Footer -->
            <div class="ma-card__footer">
              <button class="ma-detail-btn" @click="onViewDetail(app)">Ver Detalles</button>
            </div>
          </div>
        </div>

        <AppEmptyResponse v-else />
      </template>
    </template>
  </AppBaseList>

  <!-- Detail Drawer -->
  <ApplicationDetailDrawer v-if="selectedRawItem" :isVisible="showDetailModal" :item="selectedRawItem" @update:isVisible="showDetailModal = $event" @documentUploaded="reloadApplications" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';
import { useUserStore } from '../../../stores/user';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import ApplicationDetailDrawer from '../components/ApplicationDetailDrawer.vue';

import { GetMyApplicationsService } from '../services/getMyApplications.service';
import type { ApplicationDto, MyApplicationApiItemDto } from '../dtos/application.dto';

const myApplicationsService = new GetMyApplicationsService();

const BASE_STEPS = [
  { key: 'borrador', label: 'Borrador' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'subsanacion', label: 'En Subsanación' },
  { key: 'evaluada', label: 'Evaluada' },
];

function getStepsForStatus(status: string) {
  const lastStep = status === 'rechazada' ? { key: 'rechazada', label: 'Rechazada' } : { key: 'adjudicada', label: 'Adjudicada' };
  return [...BASE_STEPS, lastStep];
}

const STATUS_META: Record<string, { label: string; icon: string }> = {
  borrador: { label: 'Borrador', icon: 'pencil-alt' },
  pendiente: { label: 'Pendiente', icon: 'clock' },
  subsanacion: { label: 'En Subsanación', icon: 'exclamation-triangle' },
  evaluada: { label: 'Evaluada', icon: 'search' },
  adjudicada: { label: 'Adjudicada', icon: 'check-circle' },
  rechazada: { label: 'Rechazada', icon: 'times-circle' },
};

const STATUS_STEP_MAP: Record<string, number> = {
  borrador: 0,
  pendiente: 1,
  subsanacion: 2,
  evaluada: 3,
  adjudicada: 4,
  rechazada: 4,
};

function normalizeStatus(raw?: string): ApplicationDto['status'] {
  const s = (raw ?? '').toLowerCase().replace(/\s+/g, '');
  if (s.includes('borrador')) return 'borrador';
  if (s.includes('subsana')) return 'subsanacion';
  if (s.includes('adjudic')) return 'adjudicada';
  if (s.includes('rechaz')) return 'rechazada';
  if (s.includes('evalua')) return 'evaluada';
  if (s.includes('revis') || s.includes('pendiente') || s.includes('revi')) return 'pendiente';
  return 'pendiente';
}

function mapApiToDto(item: MyApplicationApiItemDto): ApplicationDto {
  const status = normalizeStatus(item.scholarshipStatus?.name ?? item.status);
  const submittedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';
  return {
    id: item.id,
    scholarshipName: item.scholarshipSettings?.name ?? '—',
    submittedDate,
    status,
    currentStep: STATUS_STEP_MAP[status] ?? 0,
  };
}

export default defineComponent({
  name: 'MyApplications',
  components: {
    AppBaseList,
    AppLoading,
    AppEmptyResponse,
    AppIcon,
    ApplicationDetailDrawer,
  },

  setup() {
    useMeta({ title: 'Mis Solicitudes' });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Bienestar Estudiantil', url: '' };
    headerStore.moduleItem = { name: 'Mis Solicitudes', url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const userStore = useUserStore();
    const isLoading = ref(true);
    const applications = ref<ApplicationDto[]>([]);
    const rawItems = ref<MyApplicationApiItemDto[]>([]);
    const showDetailModal = ref(false);
    const selectedRawItem = ref<MyApplicationApiItemDto | null>(null);

    onMounted(async () => {
      try {
        const peopleId = userStore.user?.people?.id;
        const response = await myApplicationsService.run(peopleId);
        const items: MyApplicationApiItemDto[] = Array.isArray(response) ? response : response?.data ?? [];
        rawItems.value = items;
        applications.value = items.map(mapApiToDto);
      } catch {
        applications.value = [];
      } finally {
        isLoading.value = false;
      }
    });

    const statusMeta = (s: string) => STATUS_META[s] ?? { label: s, icon: 'circle' };

    const onViewDetail = (app: ApplicationDto) => {
      selectedRawItem.value = rawItems.value.find((r) => r.id === app.id) ?? null;
      showDetailModal.value = true;
    };

    const reloadApplications = async () => {
      try {
        const peopleId = userStore.user?.people?.id;
        const response = await myApplicationsService.run(peopleId);
        const items: MyApplicationApiItemDto[] = Array.isArray(response) ? response : response?.data ?? [];
        rawItems.value = items;
        applications.value = items.map(mapApiToDto);
        if (selectedRawItem.value) {
          selectedRawItem.value = items.find((r) => r.id === selectedRawItem.value!.id) ?? selectedRawItem.value;
        }
      } catch {
        /* silencioso */
      }
    };

    return {
      isLoading,
      applications,
      getStepsForStatus,
      statusMeta,
      showDetailModal,
      selectedRawItem,
      onViewDetail,
      reloadApplications,
    };
  },
});
</script>

<style scoped>
/* Header */
.ma-header {
  margin-bottom: 20px;
}
.ma-header__title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}
.ma-header__subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* List */
.ma-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card */
.ma-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.ma-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.ma-card--new {
  border-color: #bfdbfe;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  animation: ma-card-enter 0.4s ease;
}
@keyframes ma-card-enter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ma-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.ma-card__name {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}
.ma-card__date {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

/* Status badge */
.ma-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}
.ma-status-badge__icon {
  font-size: 11px;
}
.ma-status-badge--borrador {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.ma-status-badge--pendiente {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}
.ma-status-badge--subsanacion {
  background: #fff7ed;
  color: #ea580c;
  border: 1px solid #fed7aa;
}
.ma-status-badge--evaluada {
  background: #faf5ff;
  color: #9333ea;
  border: 1px solid #e9d5ff;
}
.ma-status-badge--adjudicada {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.ma-status-badge--rechazada {
  background: #fff1f2;
  color: #dc2626;
  border: 1px solid #fecdd3;
}

/* Timeline */
.ma-timeline {
  display: flex;
  align-items: center;
  padding: 20px 24px;
}

.ma-tl-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.ma-tl-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
}
.ma-tl-dot__check {
  font-size: 11px;
  color: #fff;
}
.ma-tl-step--done .ma-tl-dot {
  background: #2563eb;
  border-color: #2563eb;
}
.ma-tl-step--active .ma-tl-dot {
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}
.ma-tl-label {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  font-weight: 500;
  transition: color 0.4s ease;
}
.ma-tl-step--done .ma-tl-label {
  color: #2563eb;
  font-weight: 600;
}
.ma-tl-step--active .ma-tl-label {
  color: #2563eb;
  font-weight: 700;
}

.ma-tl-step--rejected .ma-tl-dot {
  background: #dc2626;
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.2);
}
.ma-tl-step--rejected .ma-tl-label {
  color: #dc2626;
  font-weight: 700;
}

.ma-tl-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin-bottom: 18px;
  transition: background 0.4s ease;
}
.ma-tl-line--done {
  background: #2563eb;
}

/* Card Footer */
.ma-card__footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 20px 14px;
}
.ma-detail-btn {
  font-size: 12px;
  font-weight: 500;
  padding: 5px 14px;
  border-radius: 6px;
  border: 1px solid #2563eb;
  color: #2563eb;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.ma-detail-btn:hover {
  background: #2563eb;
  color: #fff;
}
</style>
