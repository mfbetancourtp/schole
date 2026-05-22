<template>
  <AppDatatable name="analytics-resources" :service="resourcesService" :params="filterParams">
    <template #filters>
      <div class="filter-group">
        <label class="filter-label">Estado</label>
        <select class="filter-select" v-model="stateFilter">
          <option value="">Todos los estados</option>
          <option value="1">Disponible</option>
          <option value="2">Asignado</option>
          <option value="3">Dañado</option>
          <option value="4">En mantenimiento</option>
        </select>
      </div>
    </template>

    <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
      <span class="cell-code">{{ row.code }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Tipo" field="resourceType.name" :sortable="true" v-slot="{ row }">
      <span class="cell-type">{{ row.resourceType?.name ?? '—' }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Serial" field="serial" v-slot="{ row }">
      <span class="cell-serial">{{ row.serial ?? '—' }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Estado" field="initialState.name" v-slot="{ row }">
      <span :class="statusClass(row.initialState?.name)">{{ row.initialState?.name ?? '—' }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Espacio asignado" field="space.name" v-slot="{ row }">
      <span class="cell-space">{{ row.space?.name ?? '—' }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Fecha de compra" field="purchaseDate" :sortable="true" v-slot="{ row }">
      <div class="cell-date">
        <AppIcon icon="calendar" class="date-icon" />
        <span>{{ formatDate(row.purchaseDate) }}</span>
      </div>
    </AppDatatableColumn>
  </AppDatatable>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetResourceInventoryService } from '../services/getResourceInventory.service';

const STATUS_CLASS: Record<string, string> = {
  Disponible: 'badge badge--available',
  Asignado: 'badge badge--assigned',
  'En mantenimiento': 'badge badge--maintenance',
  Dañado: 'badge badge--damaged',
};

export default defineComponent({
  name: 'AnalyticsResourcesTable',

  components: { AppDatatable, AppDatatableColumn, AppIcon },

  props: {
    stateId: { type: String, default: '' },
  },

  emits: ['update:stateId'],

  setup(props, { emit }) {
    const resourcesService = new GetResourceInventoryService();

    const stateFilter = computed({
      get: () => props.stateId,
      set: (val: string) => emit('update:stateId', val),
    });

    const filterParams = computed(() => (stateFilter.value !== '' ? { initialStateId: Number(stateFilter.value) } : {}));

    const statusClass = (name?: string) => (name ? STATUS_CLASS[name] ?? 'badge' : 'badge');

    const formatDate = (iso?: string) => {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('es-CO');
    };

    return {
      resourcesService,
      stateFilter,
      filterParams,
      statusClass,
      formatDate,
    };
  },
});
</script>

<style scoped>
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 160px;
}

.filter-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

.filter-select {
  padding: 0.375rem 2rem 0.375rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #fff;
  color: #374151;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.cell-code {
  color: #3b82f6;
  font-weight: 500;
  font-size: 0.875rem;
}

.cell-type {
  color: #374151;
  font-size: 0.875rem;
}

.cell-serial {
  color: #60a5fa;
  font-size: 0.75rem;
  font-family: monospace;
}

.cell-space {
  color: #4b5563;
  font-size: 0.875rem;
}

.cell-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #4b5563;
  font-size: 0.875rem;
}

.date-icon {
  color: #d1d5db;
  flex-shrink: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge::before {
  content: '';
  display: inline-block;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.badge--available {
  background: #dcfce7;
  color: #16a34a;
}

.badge--assigned {
  background: #dbeafe;
  color: #2563eb;
}

.badge--maintenance {
  background: #ffedd5;
  color: #ea580c;
}

.badge--damaged {
  background: #fee2e2;
  color: #dc2626;
}
</style>
