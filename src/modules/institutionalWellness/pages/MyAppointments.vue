<template>
  <AppBaseList title="Mis Citas">
    <template #content>
      <div class="page-header">
        <h2 class="page-header__title">Mis Citas</h2>
        <p class="page-header__subtitle">Gestiona y consulta todas tus citas programadas</p>
      </div>

      <!-- Appointments DataTable -->
      <AppDatatable :service="tableService" name="institutionalWellness.myAppointments">
        <AppDatatableColumn label="Fecha" field="date" :sortable="true" v-slot="{ row }">
          {{ row.date }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Hora" field="time" :sortable="true" v-slot="{ row }">
          {{ row.time }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Servicio" field="service" :sortable="true" v-slot="{ row }">
          {{ row.service }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Estado" field="status" v-slot="{ row }">
          <AppBadge :label="row.statusLabel" :variant="statusVariant(row.status)" />
        </AppDatatableColumn>
      </AppDatatable>

      <!-- Summary Cards -->
      <AppLoading v-if="loadingSummary" />

      <div v-else class="summary-cards">
        <AppCardDashboard size="small">
          <template #title>
            <div class="summary-card-title">
              <AppIcon icon="calendar-alt" />
              <span>Próxima Cita</span>
            </div>
          </template>
          <template #body>
            <template v-if="summary.nextAppointment">
              <p class="summary-card-value">
                {{ summary.nextAppointment.date }}
              </p>
              <p class="summary-card-sub">
                {{ summary.nextAppointment.service }}
              </p>
            </template>
            <p v-else class="summary-card-sub">Sin citas programadas</p>
          </template>
        </AppCardDashboard>

        <AppCardDashboard size="small">
          <template #title>
            <div class="summary-card-title">
              <AppIcon icon="clock" />
              <span>Citas Pendientes</span>
            </div>
          </template>
          <template #body>
            <p class="summary-card-value">{{ summary.pendingCount }}</p>
            <p class="summary-card-sub">Requiere confirmación</p>
          </template>
        </AppCardDashboard>

        <AppCardDashboard size="small">
          <template #title>
            <div class="summary-card-title">
              <AppIcon icon="check-circle" />
              <span>Citas Completadas</span>
            </div>
          </template>
          <template #body>
            <p class="summary-card-value">{{ summary.completedCount }}</p>
            <p class="summary-card-sub">Este mes</p>
          </template>
        </AppCardDashboard>
      </div>
    </template>
  </AppBaseList>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetMyAppointmentsTableService, myAppointmentsSummaryService } from '../services/myAppointments.service';
import { AppointmentStatus, AppointmentsSummary } from '../dtos/myAppointments.dto';

useMeta({ title: 'Mis Citas' });

const headerStore = useHeaderStore();
const tableService = new GetMyAppointmentsTableService();
const loadingSummary = ref(false);
const summary = ref<AppointmentsSummary>({
  nextAppointment: null,
  pendingCount: 0,
  completedCount: 0,
});

function statusVariant(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'ghost',
  };
  return map[status];
}

onMounted(async () => {
  headerStore.module = { name: 'Bienestar Institucional', url: '' };
  headerStore.moduleItem = { name: 'Mis Citas', url: '' };

  loadingSummary.value = true;
  summary.value = await myAppointmentsSummaryService.getSummary();
  loadingSummary.value = false;
});
</script>

<style scoped>
.page-header {
  margin-bottom: 1.5rem;
}

.page-header__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212b36;
  margin-bottom: 0.25rem;
}

.page-header__subtitle {
  color: #637381;
  font-size: 0.9rem;
  margin: 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}

.summary-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #637381;
  font-size: 0.85rem;
  font-weight: 600;
}

.summary-card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.summary-card-sub {
  font-size: 0.8rem;
  color: #637381;
  margin: 0;
}
</style>
