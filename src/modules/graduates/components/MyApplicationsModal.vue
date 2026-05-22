<template>
  <AppFormModal title="Mis postulaciones">
    <template #content>
      <!-- Summary stats -->
      <div class="ma-stats">
        <div class="ma-stat-item">
          <span class="ma-stat-num">{{ applications.length }}</span>
          <span class="ma-stat-label">Total</span>
        </div>
        <div class="ma-stat-item">
          <span class="ma-stat-num ma-stat-num--blue">{{ countByStatus('en_revision') + countByStatus('preseleccionado') }}</span>
          <span class="ma-stat-label">En proceso</span>
        </div>
        <div class="ma-stat-item">
          <span class="ma-stat-num ma-stat-num--green">{{ countByStatus('entrevista') + countByStatus('oferta') }}</span>
          <span class="ma-stat-label">Avanzadas</span>
        </div>
        <div class="ma-stat-item">
          <span class="ma-stat-num ma-stat-num--red">{{ countByStatus('rechazado') }}</span>
          <span class="ma-stat-label">No seleccionado</span>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="ma-filter-tabs">
        <button v-for="tab in statusTabs" :key="tab.value" class="ma-filter-tab" :class="{ 'ma-filter-tab--active': activeFilter === tab.value }" @click="activeFilter = tab.value">
          {{ tab.label }}
          <span class="ma-tab-count">{{ tab.value === 'all' ? applications.length : countByStatus(tab.value as any) }}</span>
        </button>
      </div>

      <!-- Applications list -->
      <div v-if="filteredApplications.length === 0" class="ma-empty">
        <AppIcon icon="folder-open" class="ma-empty-icon" />
        <p>No hay postulaciones en esta categoría.</p>
      </div>

      <div v-else class="ma-list">
        <div v-for="app in filteredApplications" :key="app.id" class="ma-card">
          <div class="ma-card-logo">
            <img v-if="app.companyLogo" :src="app.companyLogo" :alt="app.company" />
            <span v-else class="ma-logo-placeholder">{{ app.company.charAt(0) }}</span>
          </div>
          <div class="ma-card-info">
            <p class="ma-card-title">{{ app.vacancyTitle }}</p>
            <p class="ma-card-company">{{ app.company }} · {{ app.city }}</p>
            <div class="ma-card-meta">
              <span class="ma-card-date"> <AppIcon icon="calendar-alt" /> {{ formatDate(app.appliedAt) }} </span>
              <span class="ma-card-modality"> <AppIcon icon="building" /> {{ app.modality }} </span>
            </div>
          </div>
          <div class="ma-card-right">
            <span
              class="ma-status-badge"
              :style="{
                backgroundColor: statusColor(app.status) + '22',
                color: statusColor(app.status),
              }"
            >
              {{ statusLabel(app.status) }}
            </span>
            <button v-if="app.status !== 'rechazado' && app.status !== 'retirado'" class="ma-withdraw-btn" @click="$emit('withdraw', app)" title="Retirar postulación">
              <AppIcon icon="times" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <span class="text-muted small">Última actualización: {{ now }}</span>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { ApplicationDto, ApplicationStatus, APPLICATION_STATUS_LABEL, APPLICATION_STATUS_COLOR } from '../dtos/application.dto';

const STATUS_TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'enviada', label: 'Enviadas' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'preseleccionado', label: 'Preseleccionado' },
  { value: 'entrevista', label: 'Entrevista' },
  { value: 'oferta', label: 'Oferta' },
  { value: 'rechazado', label: 'No seleccionado' },
];

export default defineComponent({
  name: 'MyApplicationsModal',
  components: { AppFormModal, AppIcon },
  props: {
    applications: {
      type: Array as PropType<ApplicationDto[]>,
      default: () => [],
    },
  },
  emits: ['withdraw'],
  setup(props) {
    const activeFilter = ref('all');

    const filteredApplications = computed(() => (activeFilter.value === 'all' ? props.applications : props.applications.filter((a) => a.status === activeFilter.value)));

    const countByStatus = (status: ApplicationStatus) => props.applications.filter((a) => a.status === status).length;

    const statusLabel = (status: ApplicationStatus) => APPLICATION_STATUS_LABEL[status] ?? status;
    const statusColor = (status: ApplicationStatus) => APPLICATION_STATUS_COLOR[status] ?? '#6c757d';

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const now = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return {
      activeFilter,
      filteredApplications,
      countByStatus,
      statusLabel,
      statusColor,
      formatDate,
      now,
      statusTabs: STATUS_TABS,
    };
  },
});
</script>

<style scoped>
.ma-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.ma-stat-item {
  flex: 1;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
}
.ma-stat-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #374151;
  line-height: 1;
}
.ma-stat-num--blue {
  color: #2563eb;
}
.ma-stat-num--green {
  color: #16a34a;
}
.ma-stat-num--red {
  color: #dc3545;
}
.ma-stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 4px;
}
.ma-filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}
.ma-filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1.5px solid #dee2e6;
  background: #fff;
  color: #6c757d;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}
.ma-filter-tab:hover {
  border-color: #2563eb;
  color: #2563eb;
}
.ma-filter-tab--active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
.ma-tab-count {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 0 5px;
  font-size: 0.72rem;
}
.ma-filter-tab--active .ma-tab-count {
  background: rgba(255, 255, 255, 0.3);
}
.ma-empty {
  text-align: center;
  padding: 32px 16px;
  color: #9ca3af;
}
.ma-empty-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
  display: block;
}
.ma-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}
.ma-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  transition: box-shadow 0.15s;
}
.ma-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}
.ma-card-logo {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #dee2e6;
}
.ma-card-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ma-logo-placeholder {
  font-size: 1.1rem;
  font-weight: 700;
  color: #6c757d;
}
.ma-card-info {
  flex: 1;
}
.ma-card-title {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 3px;
  font-size: 0.9rem;
}
.ma-card-company {
  color: #6c757d;
  font-size: 0.82rem;
  margin: 0 0 6px;
}
.ma-card-meta {
  display: flex;
  gap: 12px;
  font-size: 0.78rem;
  color: #9ca3af;
}
.ma-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}
.ma-status-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.ma-withdraw-btn {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #9ca3af;
  padding: 2px 7px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.15s;
}
.ma-withdraw-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
}
</style>
