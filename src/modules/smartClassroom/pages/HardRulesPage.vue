<template>
  <AppBaseList>
    <template #actions />

    <template #content>
      <!-- Stats Cards -->
      <div class="container-cards mb-3">
        <AppCardDashboard size="small">
          <template #title><span>Total Reglas</span></template>
          <template #body>
            <div class="card-graph">
              <h3>{{ totalRules }}</h3>
              <AppIcon icon="list-check" />
            </div>
          </template>
        </AppCardDashboard>

        <AppCardDashboard size="small">
          <template #title><span>Facultad</span></template>
          <template #body>
            <div class="card-graph">
              <h3>{{ categoryCounts['Facultad'] || 0 }}</h3>
              <AppIcon icon="user-tie" />
            </div>
          </template>
        </AppCardDashboard>

        <AppCardDashboard size="small">
          <template #title><span>Sala</span></template>
          <template #body>
            <div class="card-graph">
              <h3>{{ categoryCounts['Sala'] || 0 }}</h3>
              <AppIcon icon="door-open" />
            </div>
          </template>
        </AppCardDashboard>

        <AppCardDashboard size="small">
          <template #title><span>Programación</span></template>
          <template #body>
            <div class="card-graph">
              <h3>{{ categoryCounts['Programación'] || 0 }}</h3>
              <AppIcon icon="calendar-alt" />
            </div>
          </template>
        </AppCardDashboard>
      </div>

      <!-- DataTable -->
      <AppDatatable :service="tableService" name="smartClassroom.hardRules">
        <AppDatatableColumn label="#" field="id" :sortable="true" v-slot="{ row }">
          <span class="fw-bold text-muted">{{ row.id }}</span>
        </AppDatatableColumn>
        <AppDatatableColumn label="Regla" field="rule" :sortable="true" v-slot="{ row }">
          {{ row.rule }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Categoría" field="category" :sortable="true" v-slot="{ row }">
          <span :class="['badge', categoryBadge(row.category)]">
            {{ row.category }}
          </span>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetHardRulesForTableService } from '../services/getHardRulesForTable.service';

const headerStore = useHeaderStore();
const tableService = new GetHardRulesForTableService();

const totalRules = 11;
const categoryCounts: Record<string, number> = {
  Facultad: 3,
  Sala: 3,
  Programación: 2,
};

function categoryBadge(category: string): string {
  const map: Record<string, string> = {
    Facultad: 'bg-primary',
    Asignación: 'bg-info text-dark',
    Programación: 'bg-warning text-dark',
    Sala: 'bg-success',
    Datos: 'bg-secondary',
    Validación: 'bg-danger',
  };
  return map[category] || 'bg-secondary';
}

onMounted(() => {
  headerStore.module = { name: 'Smart Classroom', url: '' };
  headerStore.moduleItem = { name: 'Reglas Duras', url: '' };
  headerStore.moduleSubItem = { name: '', url: '' };
});
</script>

<style scoped>
.container-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.card-graph {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
