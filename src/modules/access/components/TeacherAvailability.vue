<template>
  <div>
    <h5 class="fw-bold mb-4">Configurar disponibilidad</h5>

    <!-- Paso 1 -->
    <div class="mb-4">
      <p class="fw-semibold text-muted mb-3">Paso 1: Selecciona los días de la semana</p>
      <div class="d-flex gap-2 flex-wrap mb-2">
        <button
          v-for="day in DAYS"
          :key="day.value"
          type="button"
          :class="['btn day-btn fw-semibold', selectedDays.includes(day.value) ? 'day-btn--active' : 'day-btn--inactive']"
          @click="toggleDay(day.value)"
        >
          {{ day.abbr }}
        </button>
      </div>
      <small v-if="selectedDays.length > 0" class="text-muted">
        {{ selectedDays.length }}
        {{ selectedDays.length === 1 ? 'día seleccionado' : 'días seleccionados' }}
      </small>
    </div>

    <!-- Paso 2 -->
    <div v-if="selectedDays.length > 0">
      <p class="fw-semibold text-muted mb-3">Paso 2: Selecciona las jornadas por cada día</p>
      <div class="row g-3">
        <div v-for="dayValue in sortedSelectedDays" :key="dayValue" class="col-12 col-md-6">
          <AppCard>
            <template #title>{{ getDayName(dayValue) }}</template>
            <template #body>
              <!-- Jornadas de la institución -->
              <div
                v-for="journey in availableJourneys"
                :key="journey.id"
                class="journey-option d-flex align-items-center gap-2 p-2 rounded mb-2"
                :class="{
                  'journey-option--active': getDayConfig(dayValue).journeys[journey.id]?.selected,
                }"
                @click="toggleJourney(dayValue, journey.id)"
              >
                <div
                  class="journey-checkbox flex-shrink-0"
                  :class="{
                    'journey-checkbox--active': getDayConfig(dayValue).journeys[journey.id]?.selected,
                  }"
                >
                  <span v-if="getDayConfig(dayValue).journeys[journey.id]?.selected" class="journey-check-icon">✓</span>
                </div>
                <div>
                  <div class="small fw-semibold">{{ journey.name }}</div>
                  <div v-if="journey.timeSince && journey.timeUntil" class="small text-muted">
                    {{ formatTime(journey.timeSince) }} –
                    {{ formatTime(journey.timeUntil) }}
                  </div>
                </div>
              </div>

              <!-- Jornada personalizada -->
              <div
                class="journey-option d-flex align-items-start gap-2 p-2 rounded mb-2"
                :class="{
                  'journey-option--active': getDayConfig(dayValue).custom.selected,
                }"
                @click="toggleCustomJourney(dayValue)"
              >
                <div
                  class="journey-checkbox flex-shrink-0 mt-1"
                  :class="{
                    'journey-checkbox--active': getDayConfig(dayValue).custom.selected,
                  }"
                >
                  <span v-if="getDayConfig(dayValue).custom.selected" class="journey-check-icon">✓</span>
                </div>
                <div class="flex-fill">
                  <span class="small fw-semibold">Personalizada</span>
                  <div v-if="getDayConfig(dayValue).custom.selected" class="mt-2 row g-2" @click.stop>
                    <div class="col-12 col-sm-6">
                      <label class="form-label small mb-1">Hora inicio</label>
                      <input type="time" class="form-control form-control-sm" v-model="getDayConfig(dayValue).custom.timeSince" @blur="onCustomTimeBlur(dayValue)" />
                    </div>
                    <div class="col-12 col-sm-6">
                      <label class="form-label small mb-1">Hora fin</label>
                      <input type="time" class="form-control form-control-sm" v-model="getDayConfig(dayValue).custom.timeUntil" @blur="onCustomTimeBlur(dayValue)" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
      </div>
    </div>

    <!-- Continuar -->
    <div class="d-flex justify-content-end mt-4">
      <AppButton variant="primary" :outlined="false" @click="handleContinue"> Continuar </AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import { ToastService } from '../../../shared/services/toast.service';

import { GetJourneysService } from '../services/getJourneys.service';
import { GetTeacherJourneysByUserService } from '../services/getTeacherJourneysByUser.service';
import { CreateTeacherJourneyService } from '../services/createTeacherJourney.service';
import { DeleteTeacherJourneyService } from '../services/deleteTeacherJourney.service';
import { CreatePersonalizedJourneyTeacherService } from '../services/createPersonalizedJourneyTeacher.service';
import { UpdatePersonalizedJourneyTeacherService } from '../services/updatePersonalizedJourneyTeacher.service';
import { DeletePersonalizedJourneyTeacherService } from '../services/deletePersonalizedJourneyTeacher.service';
import type { JourneyDto, TeacherJourneysByUserDto } from '../dtos/teacherJourney.dto';

const DAYS = [
  { value: 1, abbr: 'Lun', name: 'Lunes' },
  { value: 2, abbr: 'Mar', name: 'Martes' },
  { value: 3, abbr: 'Mié', name: 'Miércoles' },
  { value: 4, abbr: 'Jue', name: 'Jueves' },
  { value: 5, abbr: 'Vie', name: 'Viernes' },
  { value: 6, abbr: 'Sáb', name: 'Sábado' },
  { value: 0, abbr: 'Dom', name: 'Domingo' },
];

interface JourneyEntry {
  selected: boolean;
  existingId: number | null;
}

interface CustomEntry {
  selected: boolean;
  existingId: number | null;
  timeSince: string;
  timeUntil: string;
  existingPersonalizedJourneyId: number | null;
}

interface DayConfig {
  journeys: Record<number, JourneyEntry>;
  custom: CustomEntry;
}

const getJourneysService = new GetJourneysService();
const getTeacherJourneysService = new GetTeacherJourneysByUserService();
const createTeacherJourneyService = new CreateTeacherJourneyService();
const deleteTeacherJourneyService = new DeleteTeacherJourneyService();
const createPersonalizedJourneyService = new CreatePersonalizedJourneyTeacherService();
const updatePersonalizedJourneyService = new UpdatePersonalizedJourneyTeacherService();
const deletePersonalizedJourneyService = new DeletePersonalizedJourneyTeacherService();
const toastService = new ToastService();

export default defineComponent({
  name: 'TeacherAvailability',
  components: { AppButton, AppCard },
  emits: ['saved'],
  props: {
    userId: { type: Number, required: true },
  },
  setup(props, { emit }) {
    const selectedDays = ref<number[]>([]);
    const dayConfigs = reactive<Record<number, DayConfig>>({});
    const availableJourneys = ref<JourneyDto[]>([]);

    const sortedSelectedDays = computed(() =>
      [...selectedDays.value].sort((a, b) => {
        const order = [1, 2, 3, 4, 5, 6, 0];
        return order.indexOf(a) - order.indexOf(b);
      })
    );

    const getDayName = (value: number) => DAYS.find((d) => d.value === value)?.name ?? '';
    const formatTime = (time: string) => time.substring(0, 5);

    const emptyCustomEntry = (): CustomEntry => ({
      selected: false,
      existingId: null,
      timeSince: '',
      timeUntil: '',
      existingPersonalizedJourneyId: null,
    });

    const initDayState = (dayValue: number) => {
      if (!dayConfigs[dayValue]) {
        dayConfigs[dayValue] = { journeys: {}, custom: emptyCustomEntry() };
      }
    };

    const getDayConfig = (dayValue: number): DayConfig => {
      if (!dayConfigs[dayValue]) initDayState(dayValue);
      return dayConfigs[dayValue];
    };

    // --- Acciones por día ---

    const toggleDay = async (dayValue: number) => {
      const idx = selectedDays.value.indexOf(dayValue);
      if (idx >= 0) {
        // Deseleccionar día → eliminar todos sus records en paralelo
        selectedDays.value.splice(idx, 1);
        const config = dayConfigs[dayValue];
        if (!config) return;

        const deletions: Promise<any>[] = [];

        for (const entry of Object.values(config.journeys)) {
          if (entry.existingId) {
            deletions.push(
              deleteTeacherJourneyService.run(entry.existingId).then(() => {
                entry.existingId = null;
                entry.selected = false;
              })
            );
          } else {
            entry.selected = false;
          }
        }

        if (config.custom.existingId) {
          deletions.push(
            deleteTeacherJourneyService.run(config.custom.existingId).then(async () => {
              if (config.custom.existingPersonalizedJourneyId) {
                await deletePersonalizedJourneyService.run(config.custom.existingPersonalizedJourneyId);
                config.custom.existingPersonalizedJourneyId = null;
              }
              config.custom.existingId = null;
            })
          );
        }

        await Promise.allSettled(deletions);

        config.custom.selected = false;
        config.custom.timeSince = '';
        config.custom.timeUntil = '';
      } else {
        // Seleccionar día → solo mostrar opciones
        selectedDays.value.push(dayValue);
        initDayState(dayValue);
      }
    };

    // --- Acciones por jornada ---

    const toggleJourney = async (dayValue: number, journeyId: number) => {
      const config = getDayConfig(dayValue);
      if (!config.journeys[journeyId]) {
        config.journeys[journeyId] = { selected: false, existingId: null };
      }
      const entry = config.journeys[journeyId];

      if (!entry.selected) {
        // Seleccionar → POST inmediato
        entry.selected = true;
        const created = await createTeacherJourneyService.run({
          weekDay: dayValue,
          journeyId,
        });
        entry.existingId = (created as any)?.id ?? null;
      } else {
        // Deseleccionar → DELETE inmediato
        entry.selected = false;
        if (entry.existingId) {
          await deleteTeacherJourneyService.run(entry.existingId);
          entry.existingId = null;
        }
      }
    };

    const toggleCustomJourney = async (dayValue: number) => {
      const custom = getDayConfig(dayValue).custom;

      if (!custom.selected) {
        // Seleccionar → solo mostrar inputs, esperar que llene las horas
        custom.selected = true;
      } else {
        // Deseleccionar → DELETE teacher journey + personalized journey
        custom.selected = false;
        custom.timeSince = '';
        custom.timeUntil = '';

        if (custom.existingId) {
          await deleteTeacherJourneyService.run(custom.existingId);
          custom.existingId = null;
        }
        if (custom.existingPersonalizedJourneyId) {
          await deletePersonalizedJourneyService.run(custom.existingPersonalizedJourneyId);
          custom.existingPersonalizedJourneyId = null;
        }
      }
    };

    const onCustomTimeBlur = async (dayValue: number) => {
      const custom = getDayConfig(dayValue).custom;
      if (!custom.timeSince || !custom.timeUntil) return;

      const pjPayload = {
        timeSince: custom.timeSince,
        timeUntil: custom.timeUntil,
      };

      if (custom.existingPersonalizedJourneyId) {
        // Solo actualizar la jornada personalizada (el teacher journey no cambia)
        await updatePersonalizedJourneyService.run(custom.existingPersonalizedJourneyId, pjPayload);
      } else {
        // Crear jornada personalizada → luego teacher journey con ese ID
        const created = await createPersonalizedJourneyService.run(pjPayload);
        const newId = (created as any)?.data?.id ?? null;
        custom.existingPersonalizedJourneyId = newId;

        const tjCreated = await createTeacherJourneyService.run({
          weekDay: dayValue,
          personalizedJourneysTeachersId: newId ?? undefined,
        });
        custom.existingId = (tjCreated as any)?.id ?? null;
      }
    };

    // --- Continuar ---

    const handleContinue = () => {
      // Validar que no haya custom seleccionado sin guardar
      const pending = selectedDays.value.filter((day) => dayConfigs[day]?.custom?.selected && !dayConfigs[day].custom.existingPersonalizedJourneyId);
      if (pending.length > 0) {
        toastService.show(`Completa las horas de la jornada personalizada para: ${pending.map(getDayName).join(', ')}`, 'error');
        return;
      }
      emit('saved');
    };

    // Expose handleSave for ProfileFull nav-change trigger (just validates + returns true)
    const handleSave = async (): Promise<boolean> => {
      const pending = selectedDays.value.filter((day) => dayConfigs[day]?.custom?.selected && !dayConfigs[day].custom.existingPersonalizedJourneyId);
      if (pending.length > 0) {
        toastService.show(`Completa las horas de la jornada personalizada para: ${pending.map(getDayName).join(', ')}`, 'error');
        return false;
      }
      return true;
    };

    // --- Carga inicial ---

    const loadJourneys = async () => {
      try {
        const result = await getJourneysService.run();
        availableJourneys.value = (result as any).data ?? (Array.isArray(result) ? result : []);
      } catch {
        availableJourneys.value = [];
      }
    };

    const loadTeacherJourneys = async () => {
      try {
        const result = (await getTeacherJourneysService.run(props.userId)) as TeacherJourneysByUserDto;
        for (const key of Object.keys(result)) {
          for (const record of result[key].records) {
            const day: number = record.weekDay;
            initDayState(day);

            if (record.personalizedJourneysTeacher) {
              dayConfigs[day].custom = {
                selected: true,
                existingId: record.id,
                timeSince: record.personalizedJourneysTeacher.timeSince?.substring(0, 5) ?? '',
                timeUntil: record.personalizedJourneysTeacher.timeUntil?.substring(0, 5) ?? '',
                existingPersonalizedJourneyId: record.personalizedJourneysTeacher.id,
              };
            } else if (record.journey?.id) {
              dayConfigs[day].journeys[record.journey.id] = {
                selected: true,
                existingId: record.id,
              };
            }

            if (!selectedDays.value.includes(day)) {
              selectedDays.value.push(day);
            }
          }
        }
      } catch {
        // sin jornadas existentes
      }
    };

    onMounted(async () => {
      await Promise.all([loadJourneys(), loadTeacherJourneys()]);
    });

    return {
      DAYS,
      selectedDays,
      sortedSelectedDays,
      dayConfigs,
      availableJourneys,
      getDayName,
      formatTime,
      getDayConfig,
      toggleDay,
      toggleJourney,
      toggleCustomJourney,
      onCustomTimeBlur,
      handleContinue,
      handleSave,
    };
  },
});
</script>

<style scoped>
.day-btn {
  min-width: 62px;
  border-radius: 6px;
  font-size: 0.9rem;
  padding: 8px 12px;
  border: 1.5px solid;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.day-btn--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.day-btn--inactive {
  background-color: transparent;
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.day-btn--inactive:hover {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
  color: white;
}

.journey-option {
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}
.journey-option:hover {
  border-color: var(--color-secondary);
  background-color: rgba(var(--color-secondary-rgb), 0.05);
}
.journey-option--active {
  border-color: var(--color-secondary);
  background-color: rgba(var(--color-secondary-rgb), 0.08);
}

.journey-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, background-color 0.15s;
  flex-shrink: 0;
}
.journey-checkbox--active {
  border-color: var(--color-secondary);
  background-color: var(--color-secondary);
}
.journey-check-icon {
  color: white;
  font-size: 11px;
  line-height: 1;
  font-weight: bold;
}
</style>
