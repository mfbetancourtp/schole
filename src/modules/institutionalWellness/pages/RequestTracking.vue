<template>
  <AppBaseList title="Seguimiento de Solicitudes">
    <template #content>
      <div class="page-header">
        <h2 class="page-header__title">Seguimiento de Solicitudes</h2>
        <p class="page-header__subtitle">
          <a href="#" class="page-header__link">Monitorea y gestiona todas las solicitudes de servicios de bienestar</a>
        </p>
      </div>

      <!-- Filters bar -->
      <div class="filter-bar">
        <div class="filter-bar__item">
          <label class="filter-bar__label">Tipo de Servicio:</label>
          <AppSelect v-model="filters.serviceType" placeholder="Todos los servicios">
            <option value="">Todos los servicios</option>
            <option v-for="s in serviceOptions" :key="s" :value="s">
              {{ s }}
            </option>
          </AppSelect>
        </div>

        <div class="filter-bar__item">
          <label class="filter-bar__label">Estado de Cita:</label>
          <AppSelect v-model="filters.status" placeholder="Todos los estados">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </AppSelect>
        </div>

        <div class="filter-bar__item">
          <label class="filter-bar__label">Fecha:</label>
          <input type="date" class="o-form-control filter-date" v-model="filters.date" />
        </div>
      </div>

      <!-- DataTable -->
      <AppDatatable :service="tableService" :params="tableParams" name="institutionalWellness.requestTracking">
        <AppDatatableColumn label="Estudiante" field="student.name" :sortable="true" v-slot="{ row }">
          <div class="student-cell">
            <div class="student-cell__avatar">{{ row.student.initials }}</div>
            <span class="student-cell__name">{{ row.student.name }}</span>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn label="Servicio" field="service" :sortable="true" v-slot="{ row }">
          <span class="service-name">{{ row.service }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Fecha y Hora" field="date" :sortable="true" v-slot="{ row }">
          <div class="date-cell">
            <span class="date-cell__date">{{ row.date }}</span>
            <span class="date-cell__time">{{ row.time }}</span>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="status" v-slot="{ row }">
          <AppBadge :label="row.statusLabel" :variant="statusVariant(row.status)" />
        </AppDatatableColumn>

        <AppDatatableColumn label="Acciones" field="id" v-slot="{ row }">
          <AppButton outlined @click="openDetail(row)">
            <AppIcon icon="eye" class="me-1" />
            Ver Detalles
          </AppButton>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>

  <!-- Detail Drawer -->
  <RequestTrackingDetail v-model:isVisible="showDrawer" :row="selectedRow" />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import RequestTrackingDetail from '../components/RequestTrackingDetail.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetRequestTrackingTableService } from '../services/requestTracking.service';
import { RequestStatus, RequestTrackingRow } from '../dtos/requestTracking.dto';
import { requestTrackingMock } from '../mocks/requestTracking';

useMeta({ title: 'Seguimiento de Solicitudes' });

const headerStore = useHeaderStore();
const tableService = new GetRequestTrackingTableService();

const showDrawer = ref(false);
const selectedRow = ref<RequestTrackingRow | null>(null);

const filters = reactive({
  serviceType: '',
  status: '',
  date: '',
});

const serviceOptions = [...new Set(requestTrackingMock.map((r) => r.service))];

const tableParams = computed(() => ({
  serviceType: filters.serviceType || undefined,
  status: filters.status || undefined,
  date: filters.date || undefined,
}));

function statusVariant(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return map[status];
}

function openDetail(row: RequestTrackingRow) {
  selectedRow.value = row;
  showDrawer.value = true;
}

onMounted(() => {
  headerStore.module = { name: 'Bienestar Institucional', url: '' };
  headerStore.moduleItem = { name: 'Seguimiento de Solicitudes', url: '' };
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
  margin: 0;
  font-size: 0.9rem;
}

.page-header__link {
  color: var(--color-primary);
  text-decoration: none;
}

/* Filter bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #e5e8eb;
  border-radius: 10px;
  padding: 14px 20px;
  margin-bottom: 1.25rem;
}

.filter-bar__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-bar__label {
  font-size: 0.85rem;
  color: #637381;
  font-weight: 500;
  white-space: nowrap;
  margin: 0;
}

.filter-date {
  height: 36px;
  font-size: 0.875rem;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #212b36;
}

/* Table cells */
.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-cell__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-cell__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #212b36;
}

.service-name {
  font-size: 0.875rem;
  color: var(--color-primary);
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-cell__date {
  font-size: 0.875rem;
  font-weight: 600;
  color: #212b36;
}

.date-cell__time {
  font-size: 0.78rem;
  color: #637381;
}
</style>
