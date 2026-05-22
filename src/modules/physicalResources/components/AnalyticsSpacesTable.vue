<template>
  <AppDatatable name="analytics-spaces" :service="spacesService" :params="filterParams">
    <template #filters>
      <div class="filter-group">
        <label class="filter-label">Estado</label>
        <select class="filter-select" v-model="isActiveFilter">
          <option value="">Todos los estados</option>
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </select>
      </div>
    </template>

    <AppDatatableColumn label="Código" field="code" :sortable="true" v-slot="{ row }">
      <span class="cell-code">{{ row.code }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
      <span class="cell-name">{{ row.name }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Tipo" field="spaceTypeName" :sortable="true" v-slot="{ row }">
      <span class="cell-type">{{ row.spaceTypeName }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Ubicación" field="hierarchicalPath" v-slot="{ row }">
      <div class="cell-location">
        <AppIcon icon="map-marker-alt" class="location-icon" />
        <span class="location-text">{{ row.hierarchicalPath }}</span>
      </div>
    </AppDatatableColumn>

    <AppDatatableColumn label="Capacidad" field="capacity" :sortable="true" v-slot="{ row }">
      <span class="cell-capacity">{{ row.capacity.toLocaleString('es-CO') }}</span>
    </AppDatatableColumn>

    <AppDatatableColumn label="Estado" field="isActive" v-slot="{ row }">
      <span :class="row.isActive ? 'badge badge--active' : 'badge badge--inactive'">
        {{ row.isActive ? 'Activo' : 'Inactivo' }}
      </span>
    </AppDatatableColumn>
  </AppDatatable>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetSpacesService } from '../services/getSpaces.service';

export default defineComponent({
  name: 'AnalyticsSpacesTable',

  components: { AppDatatable, AppDatatableColumn, AppIcon },

  props: {
    isActive: { type: String, default: '' },
  },

  emits: ['update:isActive'],

  setup(props, { emit }) {
    const spacesService = new GetSpacesService();

    const isActiveFilter = computed({
      get: () => props.isActive,
      set: (val: string) => emit('update:isActive', val),
    });

    const filterParams = computed(() => (isActiveFilter.value !== '' ? { isActive: Number(isActiveFilter.value) } : {}));

    return { spacesService, isActiveFilter, filterParams };
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

.cell-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.cell-type {
  color: #60a5fa;
  font-size: 0.875rem;
}

.cell-capacity {
  color: #374151;
  font-size: 0.875rem;
}

.cell-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.location-icon {
  color: #d1d5db;
  flex-shrink: 0;
}

.location-text {
  color: #4b5563;
  font-size: 0.75rem;
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

.badge--active {
  background: #dcfce7;
  color: #16a34a;
}

.badge--inactive {
  background: #f1f5f9;
  color: #64748b;
}
</style>
