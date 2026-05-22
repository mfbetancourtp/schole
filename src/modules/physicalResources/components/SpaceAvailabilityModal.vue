<template>
  <form @submit.prevent="save">
    <AppFormModal title="Configurar disponibilidad">
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

        <!-- Step 1: Days -->
        <div class="tw-mb-4">
          <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Paso 1: Selecciona los días de la semana</p>
          <div class="d-flex flex-wrap gap-2">
            <button v-for="day in days" :key="day.value" type="button" class="day-pill" :class="{ 'day-pill--active': selectedDays.includes(day.value) }" @click="toggleDay(day.value)">
              {{ day.label }}
            </button>
          </div>
        </div>

        <!-- Empty state when no day selected -->
        <div v-if="selectedDays.length === 0" class="tw-text-center tw-py-16">
          <i class="far fa-clock tw-text-gray-300" style="font-size: 3rem"></i>
          <p class="tw-text-sm tw-text-gray-400 tw-mt-4">Selecciona al menos un día para configurar su disponibilidad</p>
        </div>

        <!-- Step 2: Time slots (shown when at least one day selected) -->
        <div v-else class="tw-mt-2">
          <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Paso 2: Configura las franjas horarias</p>

          <div class="row g-3">
            <!-- Jornadas predefinidas -->
            <div class="col-12">
              <p class="tw-text-xs tw-text-gray-500 tw-mb-2">Jornadas rápidas</p>
              <div class="d-flex flex-wrap gap-2">
                <label
                  v-for="jornada in jornadas"
                  :key="jornada.value"
                  class="jornada-chip"
                  :class="{
                    'jornada-chip--active': selectedJornadas.includes(jornada.value),
                  }"
                >
                  <input type="checkbox" :value="jornada.value" v-model="selectedJornadas" class="tw-hidden" />
                  <span class="tw-font-medium">{{ jornada.label }}</span>
                  <span class="tw-text-xs tw-opacity-70">{{ jornada.range }}</span>
                </label>
              </div>
            </div>

            <!-- Custom time range -->
            <div class="col-12">
              <div class="d-flex align-items-center gap-2 tw-mb-2">
                <div class="tw-flex-1 tw-h-px tw-bg-gray-100"></div>
                <span class="tw-text-xs tw-text-gray-400 tw-whitespace-nowrap">o rango personalizado</span>
                <div class="tw-flex-1 tw-h-px tw-bg-gray-100"></div>
              </div>
            </div>

            <div class="col-6">
              <label class="form-label tw-text-xs tw-text-gray-600 fw-semibold">Hora inicio</label>
              <input type="time" class="form-control form-control-sm" v-model="startTime" />
            </div>
            <div class="col-6">
              <label class="form-label tw-text-xs tw-text-gray-600 fw-semibold">Hora fin</label>
              <input type="time" class="form-control form-control-sm" v-model="endTime" />
            </div>

            <!-- Summary -->
            <div class="col-12">
              <div class="tw-bg-blue-50 tw-border tw-border-blue-100 tw-rounded-lg tw-p-3">
                <p class="tw-text-xs tw-font-semibold tw-text-blue-700 tw-mb-1">Resumen de disponibilidad</p>
                <p class="tw-text-xs tw-text-blue-600 tw-mb-0">
                  <span class="tw-font-medium">Días:</span>
                  {{ selectedDaysLabels }}
                </p>
                <p class="tw-text-xs tw-text-blue-600 tw-mb-0 tw-mt-1" v-if="selectedJornadas.length || (startTime && endTime)">
                  <span class="tw-font-medium">Horario:</span>
                  {{ horarioSummary }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #actions>
        <AppButton type="submit" :disabled="selectedDays.length === 0">Guardar cambio</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { SpaceDto } from '../dtos/spaceAssignment.dto';

const DAYS = [
  { label: 'Lun', value: 'mon' },
  { label: 'Mar', value: 'tue' },
  { label: 'Mié', value: 'wed' },
  { label: 'Jue', value: 'thu' },
  { label: 'Vie', value: 'fri' },
  { label: 'Sáb', value: 'sat' },
  { label: 'Dom', value: 'sun' },
];

const JORNADAS = [
  { label: 'Mañana', value: 'morning', range: '7:00 - 12:00' },
  { label: 'Tarde', value: 'afternoon', range: '12:00 - 18:00' },
  { label: 'Noche', value: 'night', range: '18:00 - 22:00' },
];

export default defineComponent({
  name: 'SpaceAvailabilityModal',

  components: { AppFormModal, AppButton },

  props: {
    space: {
      type: Object as PropType<SpaceDto>,
      required: true,
    },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const days = DAYS;
    const jornadas = JORNADAS;

    const selectedDays = ref<string[]>([]);
    const selectedJornadas = ref<string[]>([]);
    const startTime = ref('07:00');
    const endTime = ref('18:00');

    const toggleDay = (value: string) => {
      const idx = selectedDays.value.indexOf(value);
      if (idx >= 0) {
        selectedDays.value.splice(idx, 1);
      } else {
        selectedDays.value.push(value);
      }
    };

    const selectedDaysLabels = computed(() => {
      const order = DAYS.map((d) => d.value);
      return [...selectedDays.value]
        .sort((a, b) => order.indexOf(a) - order.indexOf(b))
        .map((v) => DAYS.find((d) => d.value === v)?.label)
        .join(', ');
    });

    const horarioSummary = computed(() => {
      if (selectedJornadas.value.length) {
        return selectedJornadas.value
          .map((v) => {
            const j = JORNADAS.find((j) => j.value === v);
            return `${j?.label} (${j?.range})`;
          })
          .join(', ');
      }
      return `${startTime.value} - ${endTime.value}`;
    });

    const save = () => {
      if (!selectedDays.value.length) return;
      emit('save', {
        days: selectedDays.value,
        jornadas: selectedJornadas.value,
        startTime: startTime.value,
        endTime: endTime.value,
      });
    };

    return {
      days,
      jornadas,
      selectedDays,
      selectedJornadas,
      startTime,
      endTime,
      selectedDaysLabels,
      horarioSummary,
      toggleDay,
      save,
    };
  },
});
</script>

<style scoped>
.day-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.day-pill:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #2563eb;
}

.day-pill--active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

.day-pill--active:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #fff;
}

.jornada-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 0.8rem;
  color: #374151;
  cursor: pointer;
  gap: 0.1rem;
  transition: all 0.15s;
  user-select: none;
}

.jornada-chip--active {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
}
</style>
