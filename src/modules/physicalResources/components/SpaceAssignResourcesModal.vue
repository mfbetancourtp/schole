<template>
  <form @submit.prevent="submit">
    <AppFormModal title="Asignar recursos">
      <template #content>
        <!-- Space info header -->
        <div class="tw-mb-4 tw-pb-3 tw-border-b tw-border-gray-100">
          <p class="tw-text-sm tw-font-semibold tw-text-gray-800 tw-mb-0">
            {{ space.name }}
          </p>
          <div class="d-flex align-items-center gap-1 tw-mt-1">
            <i class="fas fa-building tw-text-gray-400 tw-text-xs"></i>
            <span class="tw-text-xs tw-text-gray-500">{{ space.hierarchicalPath }}</span>
          </div>
        </div>

        <!-- Search + filters -->
        <div class="d-flex align-items-center gap-2 tw-mb-4">
          <div class="tw-flex-1 tw-relative">
            <span class="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-gray-400">
              <i class="fas fa-search tw-text-xs"></i>
            </span>
            <input type="text" class="form-control form-control-sm" style="padding-left: 2rem" placeholder="Buscar por nombre, tipo o estado..." v-model="searchQuery" />
          </div>
          <select class="form-select form-select-sm" style="width: 130px" v-model="filterType">
            <option value="">Tipo</option>
            <option v-for="t in resourceCategories" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
          <select class="form-select form-select-sm" style="width: 130px" v-model="filterStatus">
            <option value="available">Disponible</option>
            <option value="all">Todos</option>
          </select>
        </div>

        <!-- Recursos disponibles -->
        <div class="tw-mb-4">
          <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">Recursos disponibles</p>
          <div class="tw-border tw-border-gray-200 tw-rounded-lg tw-overflow-hidden">
            <table class="table table-sm mb-0 assign-table">
              <thead>
                <tr class="assign-table__head">
                  <th style="width: 36px">
                    <input type="checkbox" class="form-check-input" :checked="allAvailableSelected" @change="toggleSelectAll" />
                  </th>
                  <th>Nombre</th>
                  <th>Código / Serial</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th class="tw-text-right">Disponible</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredAvailable.length === 0">
                  <td colspan="6" class="tw-text-center tw-py-6 tw-text-gray-400 tw-text-xs">No hay recursos disponibles</td>
                </tr>
                <tr v-for="resource in filteredAvailable" :key="resource.id" class="assign-table__row">
                  <td>
                    <input type="checkbox" class="form-check-input" :value="resource.id" v-model="selectedIds" />
                  </td>
                  <td>
                    <p class="tw-text-sm tw-font-medium tw-text-gray-800 tw-mb-0">
                      {{ resource.name }}
                    </p>
                    <p class="tw-text-xs tw-text-gray-400 tw-mb-0">
                      Códigos disponibles:
                      <span v-for="(code, i) in resource.availableCodes.slice(0, 2)" :key="code">
                        <span class="code-tag">{{ code }}</span>
                        <span v-if="i < 1 && resource.availableCodes.length > 1" class="tw-text-gray-300 tw-mx-1">—</span>
                      </span>
                      <span v-if="resource.availableCodes.length > 2" class="tw-text-gray-400"> — {{ resource.availableCodes[2] }} </span>
                    </p>
                  </td>
                  <td>
                    <div class="d-flex flex-column gap-1">
                      <span v-for="code in resource.availableCodes.slice(0, 2)" :key="code" class="code-tag">
                        {{ code }}
                      </span>
                      <span v-if="resource.availableCodes.length > 2" class="tw-text-gray-400 tw-text-xs"> + {{ resource.availableCodes.length - 2 }} más </span>
                    </div>
                  </td>
                  <td>
                    <span class="tw-text-xs tw-text-gray-600">{{ resource.category }}</span>
                  </td>
                  <td>
                    <span class="status-chip status-chip--available">Disponible</span>
                  </td>
                  <td class="tw-text-right">
                    <span class="tw-text-sm tw-font-semibold tw-text-gray-700">{{ resource.available }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recursos ya asignados -->
        <div v-if="assignedResources.length > 0">
          <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">Recursos ya asignados</p>
          <div class="d-flex flex-column gap-2">
            <div v-for="(assigned, idx) in assignedResources" :key="assigned.id" class="assigned-card" :class="{ 'assigned-card--editing': editingIdx === idx }">
              <!-- Card header -->
              <div class="d-flex align-items-start justify-content-between tw-mb-2">
                <div>
                  <p class="tw-text-sm tw-font-semibold tw-text-gray-800 tw-mb-0">
                    {{ assigned.name }}
                  </p>
                  <p class="tw-text-xs tw-text-gray-400 tw-mb-0">
                    {{ assigned.category }}
                  </p>
                </div>
                <div class="d-flex gap-1 align-items-center">
                  <AppButtonEdit :class="{ 'btn-editing': editingIdx === idx }" @click="toggleEdit(idx, assigned)" />
                  <AppButtonDelete @click="removeAssigned(idx)" />
                </div>
              </div>

              <!-- Cantidad badge + códigos -->
              <div class="d-flex align-items-center gap-2 tw-mb-2">
                <span class="tw-text-xs tw-text-gray-500">Cantidad:</span>
                <span class="qty-badge">{{ assigned.quantity }}</span>
              </div>

              <div class="d-flex align-items-center flex-wrap gap-1">
                <span class="tw-text-xs tw-text-gray-500 tw-me-1">Códigos asociados:</span>
                <span v-for="code in assigned.codes.slice(0, 3)" :key="code" class="code-tag">
                  {{ code }}
                </span>
                <span v-if="assigned.codes.length > 3" class="more-chip"> +{{ assigned.codes.length - 3 }} más </span>
                <button v-if="assigned.codes.length > 3" type="button" class="tw-bg-transparent tw-border-0 tw-text-xs tw-text-blue-500 tw-font-medium tw-ms-1" @click="expandCodes(idx)">
                  Ver todos ({{ assigned.codes.length }})
                </button>
              </div>

              <!-- Inline edit panel -->
              <div v-if="editingIdx === idx" class="edit-panel tw-mt-3">
                <p class="tw-text-xs tw-font-semibold tw-text-gray-600 tw-mb-2">Editar unidades asignadas:</p>
                <div class="row g-2">
                  <div v-for="code in getAllCodesFor(assigned)" :key="code" class="col-6">
                    <label
                      class="edit-code-label"
                      :class="{
                        'edit-code-label--checked': editingCodes.includes(code),
                      }"
                    >
                      <input type="checkbox" class="form-check-input me-2" :value="code" v-model="editingCodes" />
                      {{ code }}
                    </label>
                  </div>
                </div>
                <div class="d-flex justify-content-end gap-2 tw-mt-3">
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="cancelEdit">Cancelar</button>
                  <button type="button" class="btn btn-sm btn-primary" @click="saveEdit(idx)">Guardar cambios</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: total selected -->
        <div class="tw-mt-4 tw-pt-3 tw-border-t tw-border-gray-100">
          <p class="tw-text-xs tw-text-gray-500 tw-mb-0">
            Total recursos seleccionados:
            <span class="tw-font-semibold tw-text-gray-700">{{ selectedIds.length }}</span>
          </p>
        </div>
      </template>

      <template #actions>
        <AppButton type="submit" :disabled="selectedIds.length === 0 && assignedResources.length === 0"> Asignar seleccionados </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import { SpaceDto } from '../dtos/spaceAssignment.dto';
import { ToastService } from '../../../shared/services/toast.service';

const toastService = new ToastService();

interface AvailableResource {
  id: number;
  name: string;
  category: string;
  available: number;
  availableCodes: string[];
  allCodes: string[];
}

interface AssignedResource {
  id: number;
  name: string;
  category: string;
  quantity: number;
  codes: string[];
}

const MOCK_AVAILABLE: AvailableResource[] = [
  {
    id: 1,
    name: 'Proyector Epson',
    category: 'Tecnología',
    available: 5,
    availableCodes: ['PRO3-001', 'Lote LT-2024-001', 'MIC-010'],
    allCodes: ['PRO3-001', 'PRO3-002', 'PRO3-003', 'PRO3-004', 'PRO3-005'],
  },
  {
    id: 2,
    name: 'Silla ergonómica',
    category: 'Mobiliario',
    available: 50,
    availableCodes: ['SIL-001', 'SIL-002', 'SIL-003'],
    allCodes: Array.from({ length: 50 }, (_, i) => `SIL-${String(i + 1).padStart(3, '0')}`),
  },
  {
    id: 3,
    name: 'Micrófono inalámbrico',
    category: 'Tecnología',
    available: 10,
    availableCodes: ['MIC-001', 'Lote LT-2024-002', 'MIC-010'],
    allCodes: Array.from({ length: 10 }, (_, i) => `MIC-${String(i + 1).padStart(3, '0')}`),
  },
  {
    id: 4,
    name: 'Mesa de trabajo',
    category: 'Mobiliario',
    available: 20,
    availableCodes: ['MES-001', 'MES-002', 'MES-010'],
    allCodes: Array.from({ length: 20 }, (_, i) => `MES-${String(i + 1).padStart(3, '0')}`),
  },
  {
    id: 5,
    name: 'Laptop HP',
    category: 'Tecnología',
    available: 15,
    availableCodes: ['LAP-001', 'Lote LT-2024-003', 'LAP-015'],
    allCodes: Array.from({ length: 15 }, (_, i) => `LAP-${String(i + 1).padStart(3, '0')}`),
  },
];

const MOCK_ASSIGNED: AssignedResource[] = [
  {
    id: 1,
    name: 'Proyector Epson',
    category: 'Tecnología',
    quantity: 1,
    codes: ['PRO3-001'],
  },
  {
    id: 2,
    name: 'Silla ergonómica',
    category: 'Mobiliario',
    quantity: 40,
    codes: Array.from({ length: 40 }, (_, i) => `SIL-${String(i + 1).padStart(3, '0')}`),
  },
];

export default defineComponent({
  name: 'SpaceAssignResourcesModal',

  components: { AppFormModal, AppButton, AppButtonEdit, AppButtonDelete },

  props: {
    space: {
      type: Object as PropType<SpaceDto>,
      required: true,
    },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const searchQuery = ref('');
    const filterType = ref('');
    const filterStatus = ref('available');
    const selectedIds = ref<number[]>([]);

    const availableResources = ref<AvailableResource[]>([...MOCK_AVAILABLE]);
    const assignedResources = ref<AssignedResource[]>(MOCK_ASSIGNED.map((a) => ({ ...a, codes: [...a.codes] })));

    // Inline edit state
    const editingIdx = ref<number | null>(null);
    const editingCodes = ref<string[]>([]);

    const resourceCategories = computed(() => [...new Set(availableResources.value.map((r) => r.category))]);

    const filteredAvailable = computed(() => {
      let result = availableResources.value;
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
      }
      if (filterType.value) {
        result = result.filter((r) => r.category === filterType.value);
      }
      return result;
    });

    const allAvailableSelected = computed(() => filteredAvailable.value.length > 0 && filteredAvailable.value.every((r) => selectedIds.value.includes(r.id)));

    const toggleSelectAll = () => {
      if (allAvailableSelected.value) {
        const ids = filteredAvailable.value.map((r) => r.id);
        selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id));
      } else {
        filteredAvailable.value.forEach((r) => {
          if (!selectedIds.value.includes(r.id)) selectedIds.value.push(r.id);
        });
      }
    };

    const getAllCodesFor = (assigned: AssignedResource): string[] => {
      const resource = availableResources.value.find((r) => r.name === assigned.name);
      return resource?.allCodes ?? assigned.codes;
    };

    const toggleEdit = (idx: number, assigned: AssignedResource) => {
      if (editingIdx.value === idx) {
        cancelEdit();
        return;
      }
      editingIdx.value = idx;
      editingCodes.value = [...assigned.codes];
    };

    const cancelEdit = () => {
      editingIdx.value = null;
      editingCodes.value = [];
    };

    const saveEdit = (idx: number) => {
      if (!editingCodes.value.length) return;
      const name = assignedResources.value[idx].name;
      assignedResources.value[idx].codes = [...editingCodes.value];
      assignedResources.value[idx].quantity = editingCodes.value.length;
      editingIdx.value = null;
      editingCodes.value = [];
      toastService.show(`Unidades de "${name}" actualizadas correctamente`, 'success');
    };

    const removeAssigned = (idx: number) => {
      const name = assignedResources.value[idx].name;
      if (editingIdx.value === idx) cancelEdit();
      assignedResources.value.splice(idx, 1);
      toastService.show(`Asignación de "${name}" eliminada`, 'success');
    };

    const expandCodes = (_idx: number) => {
      // toggle to show all codes — handled by editingIdx panel
    };

    const submit = () => {
      const newAssigned: AssignedResource[] = selectedIds.value.map((id) => {
        const resource = availableResources.value.find((r) => r.id === id)!;
        return {
          id: resource.id,
          name: resource.name,
          category: resource.category,
          quantity: 1,
          codes: resource.allCodes.slice(0, 1),
        };
      });

      emit('save', {
        spaceId: props.space.id,
        assigned: [...assignedResources.value, ...newAssigned],
        newIds: selectedIds.value,
      });
    };

    return {
      searchQuery,
      filterType,
      filterStatus,
      selectedIds,
      availableResources,
      assignedResources,
      editingIdx,
      editingCodes,
      resourceCategories,
      filteredAvailable,
      allAvailableSelected,
      toggleSelectAll,
      getAllCodesFor,
      toggleEdit,
      cancelEdit,
      saveEdit,
      removeAssigned,
      expandCodes,
      submit,
    };
  },
});
</script>

<style scoped>
.assign-table__head th {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #94a3b8;
  background: #f8fafc;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.assign-table__row td {
  padding: 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f8fafc;
}

.assign-table__row:last-child td {
  border-bottom: none;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-chip--available {
  background: #dcfce7;
  color: #16a34a;
}

.code-tag {
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-family: monospace;
}

.more-chip {
  display: inline-block;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

/* Assigned card */
.assigned-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.875rem 1rem;
  transition: border-color 0.15s;
}

.assigned-card--editing {
  border-color: #93c5fd;
  background: #f0f9ff;
}

/* Quantity badge */
.qty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  background: #2563eb;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 4px;
}

/* Botón editar activo (panel abierto) */
:deep(.btn-editing) {
  background: #eff6ff !important;
  border-color: #93c5fd !important;
  color: #2563eb !important;
}

/* Inline edit panel */
.edit-panel {
  background: #fff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.edit-code-label {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  font-size: 0.78rem;
  font-family: monospace;
  color: #374151;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
  width: 100%;
}

.edit-code-label:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.edit-code-label--checked {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1d4ed8;
}
</style>
