<template>
  <form @submit.prevent="save">
    <AppFormModal :title="modalTitle" subtitle="Completa la información del nuevo espacio">
      <template #content>
        <div class="row g-3">
          <!-- Código + Tipo de espacio -->
          <div class="col-6">
            <label class="form-label fw-semibold"> Código <span class="tw-text-red-500">*</span> </label>
            <input type="text" class="form-control" placeholder="Ej: AUL-A101" v-model="form.code" :class="{ 'is-invalid': errors.code }" />
            <div class="invalid-feedback" v-if="errors.code">
              {{ errors.code }}
            </div>
          </div>

          <div class="col-6">
            <label class="form-label fw-semibold"> Tipo de espacio <span class="tw-text-red-500">*</span> </label>
            <select class="form-select" v-model="form.spaceTypeId" :class="{ 'is-invalid': errors.spaceTypeId }">
              <option :value="null">Seleccionar</option>
              <option v-for="t in spaceTypes" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="errors.spaceTypeId">
              {{ errors.spaceTypeId }}
            </div>
          </div>

          <!-- Nombre -->
          <div class="col-12">
            <label class="form-label fw-semibold"> Nombre <span class="tw-text-red-500">*</span> </label>
            <input type="text" class="form-control" placeholder="Ej: Aula 101" v-model="form.name" :class="{ 'is-invalid': errors.name }" />
            <div class="invalid-feedback" v-if="errors.name">
              {{ errors.name }}
            </div>
          </div>

          <!-- Estado -->
          <div class="col-12">
            <div class="d-flex align-items-center justify-content-between tw-py-2 tw-border-t tw-border-gray-100">
              <label class="form-label fw-semibold mb-0">Estado</label>
              <div class="d-flex align-items-center gap-2">
                <div class="form-check form-switch mb-0">
                  <input class="form-check-input space-toggle" type="checkbox" id="spaceStatus" v-model="form.isActive" />
                </div>
                <label for="spaceStatus" class="mb-0 tw-text-sm" :class="form.isActive ? 'tw-text-green-600 tw-font-medium' : 'tw-text-gray-400'">
                  {{ form.isActive ? 'Activo' : 'Inactivo' }}
                </label>
              </div>
            </div>
          </div>

          <!-- Separador ubicación -->
          <div class="col-12">
            <div class="tw-border-t tw-border-gray-100 tw-pt-2">
              <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-0">Ubicación física</p>
            </div>
          </div>

          <!-- Campus + Sede -->
          <div class="col-6">
            <label class="form-label fw-semibold"> Campus <span class="tw-text-red-500">*</span> </label>
            <select class="form-select" v-model="form.campusId" :class="{ 'is-invalid': errors.campusId }" @change="onCampusChange">
              <option :value="null">Seleccionar</option>
              <option v-for="c in campusOptions" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="errors.campusId">
              {{ errors.campusId }}
            </div>
          </div>

          <div class="col-6">
            <label class="form-label fw-semibold">Sede</label>
            <select class="form-select" v-model="form.sedeId" :disabled="!form.campusId" @change="onSedeChange">
              <option :value="null">Seleccionar</option>
              <option v-for="s in filteredSedes" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>

          <!-- Edificio + Piso -->
          <div class="col-6">
            <label class="form-label fw-semibold">Edificio</label>
            <select class="form-select" v-model="form.buildingId" :disabled="!form.sedeId" @change="onBuildingChange">
              <option :value="null">Seleccionar</option>
              <option v-for="b in filteredBuildings" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>

          <div class="col-6">
            <label class="form-label fw-semibold">Piso</label>
            <select class="form-select" v-model="form.floorId" :disabled="!form.buildingId">
              <option :value="null">Seleccionar</option>
              <option v-for="f in filteredFloors" :key="f.id" :value="f.id">
                {{ f.name }}
              </option>
            </select>
          </div>

          <!-- Capacidad + Área -->
          <div class="col-6">
            <label class="form-label fw-semibold">Capacidad</label>
            <input type="number" class="form-control" placeholder="Ej: 40" v-model.number="form.capacity" min="0" />
          </div>

          <div class="col-6">
            <label class="form-label fw-semibold">Área (m²)</label>
            <input type="number" class="form-control" placeholder="Ej: 60.5" v-model.number="form.area" min="0" step="0.1" />
          </div>

          <!-- Responsable -->
          <div class="col-12">
            <label class="form-label fw-semibold">Responsable</label>
            <select class="form-select" v-model="form.responsibleId">
              <option :value="null">Seleccionar</option>
              <option v-for="r in responsibles" :key="r.id" :value="r.id">
                {{ r.name }}
              </option>
            </select>
          </div>

          <!-- Configuración de disponibilidad (collapsible) -->
          <div class="col-12">
            <div class="tw-border tw-border-gray-200 tw-rounded-lg">
              <button
                type="button"
                class="tw-w-full tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-text-left tw-bg-transparent tw-border-0"
                @click="showAvailability = !showAvailability"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="far fa-clock tw-text-gray-500"></i>
                  <div>
                    <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-0">Configuración de disponibilidad</p>
                    <p class="tw-text-xs tw-text-gray-400 tw-mb-0">Define las jornadas o franjas horarias en las que el espacio estará disponible</p>
                  </div>
                </div>
                <i class="fas tw-text-gray-400" :class="showAvailability ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>

              <div v-if="showAvailability" class="tw-px-4 tw-pb-4 tw-border-t tw-border-gray-100">
                <div class="row g-2 tw-mt-2">
                  <div class="col-12">
                    <p class="tw-text-xs tw-text-gray-500 tw-mb-2">Selecciona los días y franjas horarias de disponibilidad</p>
                  </div>
                  <div class="col-12">
                    <div class="d-flex flex-wrap gap-2">
                      <label
                        v-for="day in days"
                        :key="day.value"
                        class="day-chip"
                        :class="{
                          'day-chip--active': form.availableDays.includes(day.value),
                        }"
                      >
                        <input type="checkbox" :value="day.value" v-model="form.availableDays" class="tw-hidden" />
                        {{ day.label }}
                      </label>
                    </div>
                  </div>
                  <div class="col-6">
                    <label class="form-label tw-text-xs tw-text-gray-600">Hora inicio</label>
                    <input type="time" class="form-control form-control-sm" v-model="form.startTime" />
                  </div>
                  <div class="col-6">
                    <label class="form-label tw-text-xs tw-text-gray-600">Hora fin</label>
                    <input type="time" class="form-control form-control-sm" v-model="form.endTime" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #actions>
        <AppButton type="submit">{{ data ? 'Guardar cambios' : 'Crear espacio' }}</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { SpaceDto, SpaceTypeOption, LocationOption, ResponsibleOption } from '../dtos/spaceAssignment.dto';

const SPACE_TYPES: SpaceTypeOption[] = [
  { id: 1, name: 'Aula' },
  { id: 2, name: 'Laboratorio' },
  { id: 3, name: 'Auditorio' },
  { id: 4, name: 'Oficina' },
  { id: 5, name: 'Sala de reuniones' },
  { id: 6, name: 'Biblioteca' },
];

const CAMPUS_OPTIONS: LocationOption[] = [
  { id: 1, name: 'Campus Central' },
  { id: 2, name: 'Campus Norte' },
  { id: 3, name: 'Campus Sur' },
];

const SEDE_OPTIONS: LocationOption[] = [
  { id: 1, name: 'Sede Principal', parentId: 1 },
  { id: 2, name: 'Sede Anexa', parentId: 1 },
  { id: 3, name: 'Sede Norte', parentId: 2 },
  { id: 4, name: 'Sede Sur', parentId: 3 },
];

const BUILDING_OPTIONS: LocationOption[] = [
  { id: 1, name: 'Edificio A', parentId: 1 },
  { id: 2, name: 'Edificio B', parentId: 1 },
  { id: 3, name: 'Edificio C', parentId: 3 },
  { id: 4, name: 'Edificio D', parentId: 2 },
];

const FLOOR_OPTIONS: LocationOption[] = [
  { id: 1, name: 'Piso 1', parentId: 1 },
  { id: 2, name: 'Piso 2', parentId: 1 },
  { id: 3, name: 'Piso 3', parentId: 2 },
  { id: 4, name: 'Piso 1', parentId: 3 },
  { id: 5, name: 'Piso 2', parentId: 3 },
  { id: 6, name: 'Piso 3', parentId: 3 },
  { id: 7, name: 'Piso 1', parentId: 4 },
];

const RESPONSIBLES: ResponsibleOption[] = [
  { id: 1, name: 'Juan Pérez' },
  { id: 2, name: 'María García' },
  { id: 3, name: 'Carlos López' },
  { id: 4, name: 'Ana Martínez' },
  { id: 5, name: 'Pedro Sánchez' },
];

const DAYS = [
  { label: 'Lun', value: 'mon' },
  { label: 'Mar', value: 'tue' },
  { label: 'Mié', value: 'wed' },
  { label: 'Jue', value: 'thu' },
  { label: 'Vie', value: 'fri' },
  { label: 'Sáb', value: 'sat' },
  { label: 'Dom', value: 'sun' },
];

export default defineComponent({
  name: 'SpaceAssignmentForm',

  components: { AppFormModal, AppButton },

  props: {
    data: {
      type: Object as PropType<SpaceDto | null>,
      default: null,
    },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const showAvailability = ref(false);

    const form = reactive({
      code: props.data?.code ?? '',
      name: props.data?.name ?? '',
      spaceTypeId: props.data?.spaceTypeId ?? (null as number | null),
      isActive: props.data?.isActive ?? true,
      campusId: props.data?.campusId ?? (null as number | null),
      sedeId: props.data?.sedeId ?? (null as number | null),
      buildingId: props.data?.buildingId ?? (null as number | null),
      floorId: props.data?.floorId ?? (null as number | null),
      capacity: props.data?.capacity ?? (null as number | null),
      area: props.data?.area ?? (null as number | null),
      responsibleId: props.data?.responsibleUserId ?? (null as number | null),
      availableDays: [] as string[],
      startTime: '07:00',
      endTime: '18:00',
    });

    const errors = reactive({
      code: '',
      name: '',
      spaceTypeId: '',
      campusId: '',
    });

    const modalTitle = computed(() => (props.data ? 'Editar espacio' : 'Crear espacio'));

    const spaceTypes = SPACE_TYPES;
    const campusOptions = CAMPUS_OPTIONS;
    const responsibles = RESPONSIBLES;
    const days = DAYS;

    const filteredSedes = computed(() => (form.campusId ? SEDE_OPTIONS.filter((s) => s.parentId === form.campusId) : []));

    const filteredBuildings = computed(() => (form.sedeId ? BUILDING_OPTIONS.filter((b) => b.parentId === form.sedeId) : []));

    const filteredFloors = computed(() => (form.buildingId ? FLOOR_OPTIONS.filter((f) => f.parentId === form.buildingId) : []));

    const onCampusChange = () => {
      form.sedeId = null;
      form.buildingId = null;
      form.floorId = null;
    };

    const onSedeChange = () => {
      form.buildingId = null;
      form.floorId = null;
    };

    const onBuildingChange = () => {
      form.floorId = null;
    };

    const validate = () => {
      errors.code = form.code.trim() ? '' : 'El código es requerido';
      errors.name = form.name.trim() ? '' : 'El nombre es requerido';
      errors.spaceTypeId = form.spaceTypeId ? '' : 'El tipo de espacio es requerido';
      errors.campusId = form.campusId ? '' : 'El campus es requerido';
      return !errors.code && !errors.name && !errors.spaceTypeId && !errors.campusId;
    };

    const save = () => {
      if (!validate()) return;

      const campus = CAMPUS_OPTIONS.find((c) => c.id === form.campusId);
      const sede = SEDE_OPTIONS.find((s) => s.id === form.sedeId);
      const building = BUILDING_OPTIONS.find((b) => b.id === form.buildingId);
      const floor = FLOOR_OPTIONS.find((f) => f.id === form.floorId);
      const spaceType = SPACE_TYPES.find((t) => t.id === form.spaceTypeId);
      const responsible = RESPONSIBLES.find((r) => r.id === form.responsibleId);

      const pathParts = [campus?.name, sede?.name, building?.name, floor?.name].filter(Boolean);

      emit('save', {
        ...form,
        spaceTypeName: spaceType?.name ?? '',
        campusName: campus?.name ?? '',
        sedeName: sede?.name ?? '',
        buildingName: building?.name ?? '',
        floorName: floor?.name ?? '',
        responsibleName: responsible?.name ?? '',
        hierarchicalPath: pathParts.join(' / '),
      });
    };

    return {
      form,
      errors,
      modalTitle,
      spaceTypes,
      campusOptions,
      responsibles,
      days,
      filteredSedes,
      filteredBuildings,
      filteredFloors,
      showAvailability,
      onCampusChange,
      onSedeChange,
      onBuildingChange,
      save,
    };
  },
});
</script>

<style scoped>
.space-toggle {
  width: 2.75rem;
  height: 1.5rem;
  cursor: pointer;
}

.space-toggle:checked {
  background-color: #16a34a;
  border-color: #16a34a;
}

.day-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
}

.day-chip--active {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
</style>
