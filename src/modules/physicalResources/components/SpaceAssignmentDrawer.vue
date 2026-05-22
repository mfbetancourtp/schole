<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="xl">
    <!-- HEAD -->
    <template #head>
      <AppDrawerHeader :variant="data ? 'edit' : 'create'" :icon="data ? 'edit' : 'plus'" :title="data ? 'Editar Espacio' : 'Crear Espacio'" :subtitle="'Completa la información del espacio físico'">
        <template #meta v-if="data">
          <span class="code-badge">{{ data.code || '—' }}</span>
        </template>
      </AppDrawerHeader>
    </template>

    <!-- BODY -->
    <template #body>
      <form @submit.prevent="save" id="space-assignment-form">
        <!-- ── 1. Información Básica ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">1</div>
            <div>
              <h6 class="section-title">Información Básica</h6>
              <p class="section-sub">Datos de identificación del espacio físico</p>
            </div>
          </div>
          <div class="fields-grid">
            <div class="field-group">
              <label class="field-label">Código <span class="req">*</span></label>
              <input class="form-control" type="text" placeholder="Ej: AUL-A101" v-model="form.code" :class="{ 'is-invalid': errors.code }" />
              <div class="invalid-feedback" v-if="errors.code">
                {{ errors.code }}
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Tipo de espacio <span class="req">*</span></label>
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
          </div>
          <div class="field-group mt-3">
            <label class="field-label">Nombre <span class="req">*</span></label>
            <input class="form-control" type="text" placeholder="Ej: Aula 101" v-model="form.name" :class="{ 'is-invalid': errors.name }" />
            <div class="invalid-feedback" v-if="errors.name">
              {{ errors.name }}
            </div>
          </div>
          <div class="estado-block mt-3">
            <div class="d-flex align-items-center justify-content-between">
              <span class="field-label mb-0">Estado</span>
              <div class="d-flex align-items-center gap-2">
                <div class="form-check form-switch mb-0">
                  <input class="form-check-input" type="checkbox" role="switch" id="spaceStatusDrawer" v-model="form.isActive" />
                </div>
                <label
                  for="spaceStatusDrawer"
                  class="mb-0"
                  :style="{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: form.isActive ? '#16a34a' : '#9ca3af',
                  }"
                >
                  {{ form.isActive ? 'Activo' : 'Inactivo' }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 2. Ubicación Física ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">2</div>
            <div>
              <h6 class="section-title">Ubicación Física</h6>
              <p class="section-sub">Define la ubicación jerárquica del espacio</p>
            </div>
          </div>
          <div class="fields-grid">
            <div class="field-group">
              <label class="field-label">Campus <span class="req">*</span></label>
              <AppAutocomplete v-model="form.campusId" :options="campusOptions" @update:modelValue="onCampusChange" />
              <div class="invalid-feedback d-block" v-if="errors.campusId">
                {{ errors.campusId }}
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Edificio</label>
              <AppAutocomplete v-model="form.buildingId" :options="buildingOptions" :selectable="() => !loadingBuildings" @update:modelValue="onBuildingChange" />
            </div>
          </div>
          <div class="fields-grid mt-3">
            <div class="field-group">
              <label class="field-label">Piso</label>
              <AppAutocomplete v-model="form.floorId" :options="floorOptions" :selectable="() => !loadingFloors" />
            </div>
            <div class="field-group">
              <!-- spacer -->
            </div>
          </div>
          <div class="fields-grid mt-3">
            <div class="field-group">
              <label class="field-label">Capacidad</label>
              <input type="number" class="form-control" placeholder="Ej: 40" v-model.number="form.capacity" min="0" />
            </div>
            <div class="field-group">
              <label class="field-label">Área (m²)</label>
              <input type="number" class="form-control" placeholder="Ej: 60.5" v-model.number="form.area" min="0" step="0.1" />
            </div>
          </div>
          <div class="field-group mt-3">
            <label class="field-label">Responsable</label>
            <AppUsersForSelect :key="isVisible ? 'open' : 'closed'" :id="form.responsibleId ?? undefined" @userData="(u) => (form.responsibleId = u.id ?? null)" />
          </div>
        </div>

        <!-- ── 3. Configuración de Disponibilidad ── -->
        <div class="drawer-section">
          <div class="section-header">
            <div class="section-num">3</div>
            <div>
              <h6 class="section-title">Configuración de Disponibilidad</h6>
              <p class="section-sub">Define las jornadas disponibles para este espacio</p>
            </div>
          </div>

          <!-- Day selector -->
          <p class="field-hint mb-2">Selecciona los días de disponibilidad</p>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <button
              v-for="day in DAYS"
              :key="day.value"
              type="button"
              class="day-btn"
              :class="{
                'day-btn--active': form.availableDays.includes(day.value),
              }"
              @click="toggleDay(day.value)"
            >
              {{ day.label }}
            </button>
          </div>

          <!-- Day cards -->
          <div v-if="sortedSelectedDays.length" class="day-cards-grid mb-3">
            <div v-for="dayValue in sortedSelectedDays" :key="dayValue" class="day-card">
              <div class="day-card__header">
                <span class="day-card__name">{{ getDayName(dayValue) }}</span>
              </div>
              <div class="day-card__body">
                <div
                  v-for="journey in availableJourneys"
                  :key="journey.id"
                  class="journey-row"
                  :class="{
                    'journey-row--active': isDayJourneySelected(dayValue, journey.id),
                  }"
                  @click="toggleJourney(dayValue, journey.id)"
                >
                  <div
                    class="journey-check"
                    :class="{
                      'journey-check--active': isDayJourneySelected(dayValue, journey.id),
                    }"
                  >
                    <span v-if="isDayJourneySelected(dayValue, journey.id)" class="journey-check-icon">✓</span>
                  </div>
                  <div>
                    <div class="journey-name">{{ journey.name }}</div>
                    <div v-if="journey.timeSince && journey.timeUntil" class="journey-time">
                      {{ formatTime(journey.timeSince) }} –
                      {{ formatTime(journey.timeUntil) }}
                    </div>
                  </div>
                </div>

                <!-- Custom journey -->
                <div
                  class="journey-row"
                  :class="{
                    'journey-row--active': getDayConfig(dayValue).custom.selected,
                  }"
                  @click="toggleCustomJourney(dayValue)"
                >
                  <div
                    class="journey-check"
                    :class="{
                      'journey-check--active': getDayConfig(dayValue).custom.selected,
                    }"
                  >
                    <span v-if="getDayConfig(dayValue).custom.selected" class="journey-check-icon">✓</span>
                  </div>
                  <div class="flex-grow-1" @click.stop>
                    <div class="journey-name">Personalizada</div>
                    <div v-if="getDayConfig(dayValue).custom.selected" class="fields-grid mt-2" @click.stop>
                      <div class="field-group">
                        <label class="field-label" style="font-size: 0.75rem">Hora inicio</label>
                        <input type="time" class="form-control form-control-sm" v-model="getDayConfig(dayValue).custom.startTime" />
                      </div>
                      <div class="field-group">
                        <label class="field-label" style="font-size: 0.75rem">Hora fin</label>
                        <input type="time" class="form-control form-control-sm" v-model="getDayConfig(dayValue).custom.endTime" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Copy configuration -->
          <div v-if="sortedSelectedDays.length >= 1" class="copy-config mb-3">
            <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
              <input type="checkbox" class="form-check-input" id="enableCopyCheck" v-model="enableCopy" />
              <label for="enableCopyCheck" class="form-check-label field-hint">Copiar configuración de otro día</label>
            </div>

            <div v-if="enableCopy" class="copy-config__panel mt-3">
              <div class="row g-3 align-items-end">
                <div class="col-auto">
                  <label class="field-label" style="font-size: 0.75rem">Copiar desde</label>
                  <select class="form-select form-select-sm" v-model="copyFromDay" style="min-width: 140px">
                    <option :value="null">Seleccionar día</option>
                    <option v-for="d in sortedSelectedDays" :key="d" :value="d">
                      {{ getDayName(d) }}
                    </option>
                  </select>
                </div>
                <div class="col">
                  <label class="field-label" style="font-size: 0.75rem">Copiar a</label>
                  <div class="d-flex flex-wrap gap-1">
                    <label
                      v-for="day in DAYS.filter((x) => x.value !== copyFromDay)"
                      :key="day.value"
                      class="copy-dest-chip"
                      :class="{
                        'copy-dest-chip--active': copyToDays.includes(day.value),
                      }"
                    >
                      <input type="checkbox" :value="day.value" v-model="copyToDays" class="d-none" />
                      {{ day.fullName }}
                    </label>
                  </div>
                </div>
                <div class="col-auto">
                  <AppButton @click.prevent="applyCopy" :disabled="!copyFromDay || !copyToDays.length">Aplicar</AppButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div v-if="sortedSelectedDays.length" class="avail-summary">
            <p class="field-label mb-2">Resumen de disponibilidad</p>
            <div class="summary-grid">
              <div v-for="dayValue in sortedSelectedDays" :key="dayValue" class="summary-item">
                <span class="summary-day">{{ getDayName(dayValue) }}</span>
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <span v-for="j in getSelectedJourneysForDay(dayValue)" :key="j" class="summary-chip">{{ j }}</span>
                  <span v-if="!getSelectedJourneysForDay(dayValue).length" class="field-hint">Sin jornadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex align-items-center justify-content-between w-100">
        <span class="req-note">* Campos obligatorios</span>
        <div class="d-flex gap-2">
          <AppButton label="Cancelar" outlined variant="secondary" @click="$emit('update:isVisible', false)" />
          <AppButton :label="data ? 'Guardar cambios' : 'Crear espacio'" variant="primary" nativeType="submit" form="space-assignment-form" />
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, PropType, reactive, ref, watch } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppUsersForSelect from '../../../shared/components/Forms/AppUsersForSelect.vue';

import { SpaceDto, SpaceTypeOption, LocationOption } from '../dtos/spaceAssignment.dto';
import { JourneyDto } from '../dtos/journey.dto';
import { GetJourneysService } from '../services/getJourneys.service';
import { GetCampusesService } from '../services/getCampuses.service';
import { GetBuildingsByCampusService } from '../services/getBuildingsByCampus.service';
import { GetFloorsByBuildingService } from '../services/getFloorsByBuilding.service';
import { GetSpaceTypesService } from '../services/getSpaceTypes.service';

const getJourneysService = new GetJourneysService();
const getCampusesService = new GetCampusesService();
const getBuildingsByCampusService = new GetBuildingsByCampusService();
const getFloorsByBuildingService = new GetFloorsByBuildingService();
const getSpaceTypesService = new GetSpaceTypesService();

const DAYS = [
  { label: 'Lun', value: 'mon', sortOrder: 0, fullName: 'Lunes' },
  { label: 'Mar', value: 'tue', sortOrder: 1, fullName: 'Martes' },
  { label: 'Mié', value: 'wed', sortOrder: 2, fullName: 'Miércoles' },
  { label: 'Jue', value: 'thu', sortOrder: 3, fullName: 'Jueves' },
  { label: 'Vie', value: 'fri', sortOrder: 4, fullName: 'Viernes' },
  { label: 'Sáb', value: 'sat', sortOrder: 5, fullName: 'Sábado' },
  { label: 'Dom', value: 'sun', sortOrder: 6, fullName: 'Domingo' },
];

interface CustomEntry {
  selected: boolean;
  startTime: string;
  endTime: string;
}

interface DayConfig {
  journeyIds: Set<number>;
  custom: CustomEntry;
}

export default defineComponent({
  name: 'SpaceAssignmentDrawer',

  components: {
    AppDrawer,
    AppDrawerHeader,
    AppButton,
    AppAutocomplete,
    AppUsersForSelect,
  },

  props: {
    isVisible: { type: Boolean, required: true },
    data: { type: Object as PropType<SpaceDto | null>, default: null },
  },

  emits: ['update:isVisible', 'save'],

  setup(props, { emit }) {
    const availableJourneys = ref<JourneyDto[]>([]);

    // ── API-backed location options ──────────────────────────────────────────
    const campusOptions = ref<LocationOption[]>([]);
    const buildingOptions = ref<LocationOption[]>([]);
    const floorOptions = ref<LocationOption[]>([]);
    const spaceTypeOptions = ref<SpaceTypeOption[]>([]);
    const loadingBuildings = ref(false);
    const loadingFloors = ref(false);

    /**
     * El backend puede devolver los ids de ubicación como campos planos
     * (`campusId`, `buildingId`, `floorId`) o anidados bajo la relación
     * `floor.building.campus`. Hacemos fallback a la ruta anidada para que
     * en modo edición los selectores se poblen siempre.
     */
    const buildForm = () => {
      const d = props.data as any;
      const floor = d?.floor ?? null;
      const building = floor?.building ?? d?.building ?? null;
      const campus = building?.campus ?? d?.campus ?? null;
      return {
        code: d?.code ?? '',
        name: d?.name ?? '',
        spaceTypeId: d?.spaceTypeId ?? d?.spaceType?.id ?? (null as number | null),
        // Forzamos booleano: v-model del checkbox solo reconoce `true`
        // para marcar el switch. Si el backend devuelve 1, "true", etc.,
        // el label mostraba "Activo" pero el toggle quedaba apagado.
        isActive: d?.isActive == null ? true : Boolean(d.isActive),
        // Cubrimos las tres formas conocidas: plano, objeto anidado
        // expandido y solo el id referencial en la relación.
        campusId: d?.campusId ?? campus?.id ?? building?.campusId ?? (null as number | null),
        buildingId: d?.buildingId ?? building?.id ?? floor?.buildingId ?? (null as number | null),
        floorId: d?.floorId ?? floor?.id ?? (null as number | null),
        capacity: d?.capacity ?? (null as number | null),
        area: d?.area ?? (null as number | null),
        responsibleId: d?.responsibleUserId ?? d?.responsibleUser?.id ?? (null as number | null),
        availableDays: [] as string[],
      };
    };

    const form = reactive(buildForm());
    const errors = reactive({
      code: '',
      name: '',
      spaceTypeId: '',
      campusId: '',
    });

    // Day configs
    const dayConfigs = reactive<Record<string, DayConfig>>({});

    const getDayConfig = (dayValue: string): DayConfig => {
      if (!dayConfigs[dayValue]) {
        dayConfigs[dayValue] = {
          journeyIds: new Set(),
          custom: { selected: false, startTime: '07:00', endTime: '18:00' },
        };
      }
      return dayConfigs[dayValue];
    };

    const sortedSelectedDays = computed(() =>
      [...form.availableDays].sort((a, b) => {
        const ai = DAYS.findIndex((d) => d.value === a);
        const bi = DAYS.findIndex((d) => d.value === b);
        return ai - bi;
      })
    );

    const getDayName = (value: string) => DAYS.find((d) => d.value === value)?.fullName ?? value;
    const formatTime = (t: string) => t.substring(0, 5);

    const toggleDay = (value: string) => {
      const idx = form.availableDays.indexOf(value);
      if (idx >= 0) {
        form.availableDays.splice(idx, 1);
      } else {
        form.availableDays.push(value);
        getDayConfig(value);
      }
    };

    const isDayJourneySelected = (dayValue: string, journeyId: number) => getDayConfig(dayValue).journeyIds.has(journeyId);

    const toggleJourney = (dayValue: string, journeyId: number) => {
      const cfg = getDayConfig(dayValue);
      if (cfg.journeyIds.has(journeyId)) {
        cfg.journeyIds.delete(journeyId);
      } else {
        cfg.journeyIds.add(journeyId);
      }
    };

    const toggleCustomJourney = (dayValue: string) => {
      const cfg = getDayConfig(dayValue);
      cfg.custom.selected = !cfg.custom.selected;
    };

    // Copy config
    const enableCopy = ref(false);
    const copyFromDay = ref<string | null>(null);
    const copyToDays = ref<string[]>([]);

    const applyCopy = () => {
      if (!copyFromDay.value || !copyToDays.value.length) return;
      const src = getDayConfig(copyFromDay.value);
      copyToDays.value.forEach((dest) => {
        if (!form.availableDays.includes(dest)) {
          form.availableDays.push(dest);
        }
        const dst = getDayConfig(dest);
        dst.journeyIds = new Set(src.journeyIds);
        dst.custom = { ...src.custom };
      });
      copyToDays.value = [];
    };

    const getSelectedJourneysForDay = (dayValue: string): string[] => {
      const cfg = getDayConfig(dayValue);
      const labels: string[] = [];
      cfg.journeyIds.forEach((id) => {
        const j = availableJourneys.value.find((x) => x.id === id);
        if (j) labels.push(j.name);
      });
      if (cfg.custom.selected && cfg.custom.startTime && cfg.custom.endTime) {
        labels.push(`${cfg.custom.startTime} – ${cfg.custom.endTime}`);
      }
      return labels;
    };

    /**
     * Bandera para diferenciar un cambio disparado por el usuario de
     * la asignación inicial que hace el `watch` al abrir el drawer.
     * `AppAutocomplete` re-emite `update:modelValue` cuando el v-model
     * recibe un valor desde fuera, lo que disparaba `onCampusChange` y
     * reseteaba `buildingId` y `floorId` a null.
     */
    const hydrating = ref(false);

    // Location cascades (lazy loaded from API)
    const onCampusChange = async (campusId: number | string | null) => {
      if (hydrating.value) return;
      form.buildingId = null;
      form.floorId = null;
      buildingOptions.value = [];
      floorOptions.value = [];
      if (campusId == null) return;
      loadingBuildings.value = true;
      try {
        const nodes = await getBuildingsByCampusService.run(Number(campusId));
        buildingOptions.value = nodes.map((n) => ({ id: n.id, name: n.name }));
      } finally {
        loadingBuildings.value = false;
      }
    };

    const onBuildingChange = async (buildingId: number | string | null) => {
      if (hydrating.value) return;
      form.floorId = null;
      floorOptions.value = [];
      if (buildingId == null) return;
      loadingFloors.value = true;
      try {
        const nodes = await getFloorsByBuildingService.run(Number(buildingId));
        floorOptions.value = nodes.map((n) => ({ id: n.id, name: n.name }));
      } finally {
        loadingFloors.value = false;
      }
    };

    /**
     * Normaliza el `weekDay` que viene del backend (puede ser `MONDAY`,
     * `mon`, `1`, etc.) al valor interno que usa el componente (`mon`,
     * `tue`, ...).
     */
    const WEEKDAY_MAP: Record<string, string> = {
      MONDAY: 'mon',
      TUESDAY: 'tue',
      WEDNESDAY: 'wed',
      THURSDAY: 'thu',
      FRIDAY: 'fri',
      SATURDAY: 'sat',
      SUNDAY: 'sun',
      mon: 'mon',
      tue: 'tue',
      wed: 'wed',
      thu: 'thu',
      fri: 'fri',
      sat: 'sat',
      sun: 'sun',
      '1': 'mon',
      '2': 'tue',
      '3': 'wed',
      '4': 'thu',
      '5': 'fri',
      '6': 'sat',
      '7': 'sun',
      '0': 'sun',
    };
    const normalizeWeekDay = (value: unknown): string | null => {
      if (value == null) return null;
      const key = String(value);
      return WEEKDAY_MAP[key] ?? WEEKDAY_MAP[key.toUpperCase()] ?? null;
    };
    const toHHmm = (t: unknown): string => {
      if (typeof t !== 'string' || !t) return '';
      return t.slice(0, 5);
    };

    /**
     * Rellena `form.availableDays` y `dayConfigs` a partir del arreglo
     * `calendar` que devuelve el backend. Cada entrada tiene la forma
     * `{ weekDay, journeys[], personalizedJourneys[] }`.
     */
    const populateCalendar = (calendar: any[] | undefined) => {
      if (!Array.isArray(calendar) || !calendar.length) return;
      for (const entry of calendar) {
        const day = normalizeWeekDay(entry?.weekDay);
        if (!day) continue;
        const hasJourneys = Array.isArray(entry?.journeys) && entry.journeys.length > 0;
        const hasCustom = Array.isArray(entry?.personalizedJourneys) && entry.personalizedJourneys.length > 0;
        if (!hasJourneys && !hasCustom) continue;

        if (!form.availableDays.includes(day)) form.availableDays.push(day);
        const cfg = getDayConfig(day);
        if (hasJourneys) {
          for (const j of entry.journeys) {
            const id = j?.id ?? j?.journeyId;
            if (typeof id === 'number') cfg.journeyIds.add(id);
          }
        }
        if (hasCustom) {
          const first = entry.personalizedJourneys[0];
          cfg.custom.selected = true;
          cfg.custom.startTime = toHHmm(first?.timeSince ?? first?.startTime) || cfg.custom.startTime;
          cfg.custom.endTime = toHHmm(first?.timeUntil ?? first?.endTime) || cfg.custom.endTime;
        }
      }
    };

    // Reset on open — also preload buildings/floors if editing an existing space
    watch(
      () => props.isVisible,
      async (visible) => {
        if (visible) {
          // Activamos la bandera para que `onCampusChange`/`onBuildingChange`
          // no reseteen los hijos durante la asignación inicial del form.
          hydrating.value = true;
          const fresh = buildForm();

          // Asignamos de inmediato los campos NO-cascada para que los
          // componentes que se remontan al abrir el drawer (p.ej.
          // `AppUsersForSelect`, cuyo `:key` depende de `isVisible`)
          // reciban los valores correctos en su primer render.
          form.code = fresh.code;
          form.name = fresh.name;
          form.spaceTypeId = fresh.spaceTypeId;
          form.capacity = fresh.capacity;
          form.area = fresh.area;
          form.responsibleId = fresh.responsibleId;
          form.isActive = fresh.isActive;
          form.availableDays = fresh.availableDays;

          // IMPORTANTE: cargamos las opciones de edificio/piso PRIMERO
          // (antes de asignar sus ids en el form). Así, cuando el
          // `modelValue` del AppAutocomplete cambie a su valor real,
          // `options` ya contendrá ese id y el watcher interno que
          // "limpia selección si ya no existe en las opciones" no se
          // dispara.
          let nextBuildingOptions: Array<{ id: number; name: string }> = [];
          let nextFloorOptions: Array<{ id: number; name: string }> = [];
          if (fresh.campusId) {
            loadingBuildings.value = true;
            try {
              const nodes = await getBuildingsByCampusService.run(Number(fresh.campusId));
              nextBuildingOptions = nodes.map((n) => ({
                id: n.id,
                name: n.name,
              }));
            } finally {
              loadingBuildings.value = false;
            }
          }
          if (fresh.buildingId) {
            loadingFloors.value = true;
            try {
              const nodes = await getFloorsByBuildingService.run(Number(fresh.buildingId));
              nextFloorOptions = nodes.map((n) => ({ id: n.id, name: n.name }));
            } finally {
              loadingFloors.value = false;
            }
          }

          // Ahora sí asignamos las opciones y el form en el mismo "tick"
          // síncrono. Vue batchea los updates: cuando el hijo reciba los
          // nuevos props, `options` ya incluye el id seleccionado.
          buildingOptions.value = nextBuildingOptions;
          floorOptions.value = nextFloorOptions;
          Object.assign(form, fresh);
          errors.code = '';
          errors.name = '';
          errors.spaceTypeId = '';
          errors.campusId = '';
          Object.keys(dayConfigs).forEach((k) => delete (dayConfigs as any)[k]);
          enableCopy.value = false;
          copyFromDay.value = null;
          copyToDays.value = [];

          // Populate calendar from backend when editing
          populateCalendar((props.data as any)?.calendar);

          // Esperamos a que Vue termine el ciclo de renderizado actual
          // antes de bajar la bandera. Sin este `nextTick`, los
          // `AppAutocomplete` re-emiten `update:modelValue` después de
          // procesar el cambio programático de v-model, lo que dispara
          // los handlers de cascada y borra `buildingId`/`floorId`
          // recién asignados.
          await nextTick();
          // Segundo tick por si algún componente hijo hace su propio
          // flush asíncrono al recibir el nuevo modelValue.
          await nextTick();

          // Si después del flush los ids quedaron en null (porque algún
          // handler se ejecutó de todos modos), los restauramos desde
          // los valores frescos originales.
          if (fresh.buildingId && !form.buildingId) form.buildingId = fresh.buildingId;
          if (fresh.floorId && !form.floorId) form.floorId = fresh.floorId;

          // Hidratación completada: a partir de aquí los handlers
          // `onCampusChange`/`onBuildingChange` vuelven a funcionar para
          // las interacciones reales del usuario.
          hydrating.value = false;
        }
      }
    );

    const validate = () => {
      errors.code = form.code.trim() ? '' : 'El código es requerido';
      errors.name = form.name.trim() ? '' : 'El nombre es requerido';
      errors.spaceTypeId = form.spaceTypeId ? '' : 'El tipo de espacio es requerido';
      errors.campusId = form.campusId ? '' : 'El campus es requerido';
      return !errors.code && !errors.name && !errors.spaceTypeId && !errors.campusId;
    };

    const save = () => {
      if (!validate()) return;
      const campus = campusOptions.value.find((c) => c.id === form.campusId);
      const building = buildingOptions.value.find((b) => b.id === form.buildingId);
      const floor = floorOptions.value.find((f) => f.id === form.floorId);
      const spaceType = spaceTypeOptions.value.find((t) => t.id === form.spaceTypeId);
      const pathParts = [campus?.name, building?.name, floor?.name].filter(Boolean);
      emit('save', {
        code: form.code,
        name: form.name,
        spaceTypeId: form.spaceTypeId,
        floorId: form.floorId,
        responsibleId: form.responsibleId,
        capacity: form.capacity,
        area: form.area,
        isActive: form.isActive,
        campusId: form.campusId,
        buildingId: form.buildingId,
        spaceTypeName: spaceType?.name ?? '',
        campusName: campus?.name ?? '',
        buildingName: building?.name ?? '',
        floorName: floor?.name ?? '',
        hierarchicalPath: pathParts.join(' / '),
      });
    };

    onMounted(async () => {
      // Load journeys
      try {
        const result = await getJourneysService.run();
        availableJourneys.value = (result as any).data ?? (Array.isArray(result) ? result : []);
      } catch {
        availableJourneys.value = [
          {
            id: 1,
            name: 'Mañana',
            timeSince: '07:00:00',
            timeUntil: '12:00:00',
          },
          {
            id: 2,
            name: 'Tarde',
            timeSince: '12:00:00',
            timeUntil: '18:00:00',
          },
          {
            id: 3,
            name: 'Noche',
            timeSince: '18:00:00',
            timeUntil: '22:00:00',
          },
        ];
      }

      // Load campuses
      try {
        const nodes = await getCampusesService.run();
        campusOptions.value = nodes.map((n) => ({ id: n.id, name: n.name }));
      } catch {
        campusOptions.value = [];
      }

      // Load space types
      try {
        const result = await getSpaceTypesService.run({ noPag: true });
        const list = Array.isArray(result) ? result : result?.data ?? [];
        spaceTypeOptions.value = list.map((t: any) => ({
          id: t._id ?? t.id,
          name: t.name ?? '',
        }));
      } catch {
        spaceTypeOptions.value = [];
      }
    });

    return {
      form,
      errors,
      DAYS,
      spaceTypes: spaceTypeOptions,
      campusOptions,
      buildingOptions,
      floorOptions,
      loadingBuildings,
      loadingFloors,
      availableJourneys,
      sortedSelectedDays,
      dayConfigs,
      enableCopy,
      copyFromDay,
      copyToDays,
      getDayName,
      formatTime,
      getDayConfig,
      isDayJourneySelected,
      toggleDay,
      toggleJourney,
      toggleCustomJourney,
      applyCopy,
      getSelectedJourneysForDay,
      onCampusChange,
      onBuildingChange,
      save,
    };
  },
});
</script>

<style scoped>
/* HEAD */
.code-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
}

/* Section layout */
.drawer-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}
.section-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.section-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e8f0fe;
  color: #1e3a8a;
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.section-title {
  font-weight: 700;
  color: #111827;
  font-size: 0.92rem;
  margin-bottom: 2px;
}
.section-sub {
  color: #9ca3af;
  font-size: 0.78rem;
  margin-bottom: 0;
}

/* Fields */
.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field-group {
  display: flex;
  flex-direction: column;
}
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
}
.field-hint {
  font-size: 0.72rem;
  color: #9ca3af;
}
.req {
  color: #ef4444;
}

/* Estado block */
.estado-block {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
}

/* Footer */
.req-note {
  font-size: 0.78rem;
  color: #9ca3af;
}

/* Day selector buttons */
.day-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4.5rem;
  padding: 0.55rem 1.1rem;
  border-radius: 6px;
  border: 1.5px solid #e2e8f0;
  background: transparent;
  font-size: 0.88rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.day-btn:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}
.day-btn--active {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

/* Day cards */
.day-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.day-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.day-card__header {
  padding: 0.5rem 0.75rem;
}
.day-card__name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
}
.day-card__body {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Journey rows */
.journey-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.12s, background-color 0.12s;
}
.journey-row:hover {
  background: #eff6ff;
}
.journey-row--active {
  border-color: #2563eb;
  background: #eff6ff;
}
.journey-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}
.journey-time {
  font-size: 0.75rem;
  color: #9ca3af;
}
.journey-check {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: border-color 0.12s, background-color 0.12s;
}
.journey-check--active {
  border-color: #2563eb;
  background-color: #2563eb;
}
.journey-check-icon {
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
}

/* Copy config */
.copy-config {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
}
.copy-config__panel {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.75rem;
}
.copy-dest-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  border: 1.5px solid #e2e8f0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
}
.copy-dest-chip--active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

/* Summary */
.avail-summary {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}
.summary-item {
  padding: 0.5rem;
}
.summary-day {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
}
.summary-chip {
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}
</style>
