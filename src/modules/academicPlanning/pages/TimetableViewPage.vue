<template>
  <AppBaseList :title="pageTitle" :routes="routes">
    <template #actions>
      <AppButtonBack :to="{ name: 'academicPlanning.loadManagement' }" />
    </template>

    <template #content>
      <AppLoading v-if="isLoading" />

      <div v-else-if="loadError || !timetable" class="tv__noData">
        <div class="tv__noDataIcon"><AppIcon icon="calendar-times" /></div>
        <p>{{ loadError || 'No se encontraron datos del horario.' }}</p>
      </div>

      <template v-else>
        <div class="containerCards">
          <section class="tv__wizardSurface">
            <AppWizardStepper v-model="currentStep" :steps="wizardSteps" :clickable="true" />
          </section>

          <section class="tv__stepIntro">
            <span class="tv__stepKicker">Paso {{ currentStep }} de {{ wizardSteps.length }}</span>
            <h3 class="tv__stepTitle">{{ currentStepMeta.title }}</h3>
            <p class="tv__stepDescription">{{ currentStepMeta.description }}</p>
          </section>

          <template v-if="currentStep === 1">
            <div class="tv__topGrid">
              <AppCard class="tv__headerCard">
                <template #title>
                  <div class="tv__cardTitle">
                    <div class="tv__cardTitleIcon">
                      <AppIcon icon="calendar-alt" />
                    </div>
                    <div>
                      <div class="tv__title">{{ timetable.name }}</div>
                      <div class="tv__subtitle">{{ timetable.department }} · {{ timetable.year }}</div>
                    </div>
                  </div>
                </template>
                <template #body>
                  <div class="tv__statsRow">
                    <div class="tv__statCard tv__statCard--blue">
                      <span class="tv__statValue">{{ timetable.metadata?.totalHours ?? 0 }}</span>
                      <span class="tv__statLabel">Total de horas</span>
                    </div>
                    <div class="tv__statCard tv__statCard--green">
                      <span class="tv__statValue">{{ timetable.metadata?.utilizationRateLabel ?? '0%' }}</span>
                      <span class="tv__statLabel">Utilización</span>
                    </div>
                    <div class="tv__statCard" :class="conflictCount > 0 ? 'tv__statCard--red' : 'tv__statCard--gray'">
                      <span class="tv__statValue">{{ conflictCount }}</span>
                      <span class="tv__statLabel">Conflictos</span>
                    </div>
                    <div class="tv__statCard tv__statCard--purple">
                      <span class="tv__statValue">{{ uniqueCourses }}</span>
                      <span class="tv__statLabel">Asignaturas</span>
                    </div>
                  </div>
                </template>
              </AppCard>

              <AppCard class="tv__aiCard">
                <template #title>
                  <div class="tv__aiCardTitle">
                    <div class="tv__aiIconWrap"><AppIcon icon="robot" /></div>
                    <div>
                      <div class="tv__aiTitle">Ajustar horario con IA</div>
                      <div class="tv__aiDescription">Describe el ajuste y la IA reorganizará el horario automáticamente.</div>
                    </div>
                  </div>
                </template>
                <template #body>
                  <textarea
                    v-model="aiQuery"
                    class="tv__aiTextarea"
                    placeholder="Ej: Mueve las clases del lunes a los martes, evita horas antes de las 8am..."
                    rows="4"
                    :disabled="isGeneratingAiTimetable"
                  ></textarea>
                  <div class="tv__aiFooter">
                    <p v-if="aiGenerationError" class="tv__aiMessage tv__aiMessage--error">
                      {{ aiGenerationError }}
                    </p>
                    <button type="button" class="tv__aiBtn" :disabled="!canGenerateWithAi" @click="generateTimetableWithAi">
                      <span v-if="isGeneratingAiTimetable" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <AppIcon v-else icon="magic" class="me-2" />
                      {{ isGeneratingAiTimetable ? 'Generando' : 'Generar' }}
                    </button>
                  </div>
                </template>
              </AppCard>
            </div>

            <AppCard>
              <template #title>
                <div class="tv__cardTitle">
                  <div class="tv__cardTitleIcon">
                    <AppIcon icon="info-circle" />
                  </div>
                  Información del horario
                </div>
              </template>
              <template #body>
                <div class="tv__infoGrid">
                  <article v-for="item in infoItems" :key="item.label" class="tv__infoItem">
                    <span class="tv__infoLabel">{{ item.label }}</span>
                    <strong class="tv__infoValue">{{ item.value }}</strong>
                    <span v-if="item.helper" class="tv__infoHelper">{{ item.helper }}</span>
                  </article>
                </div>
              </template>
            </AppCard>
          </template>

          <AppCard v-else-if="currentStep === 2">
            <template #title>
              <div class="tv__cardTitle">
                <div class="tv__cardTitleIcon"><AppIcon icon="table" /></div>
                Horario semanal
              </div>
            </template>
            <template #body>
              <div class="tv__gridWrapper">
                <table class="tv__grid">
                  <thead>
                    <tr>
                      <th class="tv__timeHeader">Hora</th>
                      <th v-for="day in schedulingDays" :key="day" class="tv__dayHeader">
                        {{ dayLabel(day) }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="slot in timeSlots" :key="slot">
                      <td class="tv__timeCell">{{ slot }}</td>
                      <td v-for="day in schedulingDays" :key="day" class="tv__cell">
                        <div
                          v-for="(course, i) in getCourses(day, slot)"
                          :key="i"
                          class="tv__courseCard"
                          :class="roomTypeClass(course.roomType)"
                          :title="`${course.courseName} · ${course.facultyName} · ${course.roomName}`"
                        >
                          <span class="tv__courseCode">{{ course.courseCode }}</span>
                          <span class="tv__courseName">{{ course.courseName }}</span>
                          <span class="tv__courseRoom">
                            <AppIcon icon="door-open" class="tv__courseRoomIcon" />
                            {{ course.roomName }}
                          </span>
                          <span class="tv__courseFaculty">
                            <AppIcon icon="user" class="tv__courseRoomIcon" />
                            {{ course.facultyName }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="tv__legend">
                <span class="tv__legendItem tv__legendItem--trad">Aula tradicional</span>
                <span class="tv__legendItem tv__legendItem--tech">Aula tecnológica</span>
                <span class="tv__legendItem tv__legendItem--lab">Aula laboratorio</span>
              </div>
            </template>
          </AppCard>

          <AppCard v-else-if="currentStep === 3">
            <template #title>
              <div class="tv__cardTitle">
                <div class="tv__cardTitleIcon">
                  <AppIcon icon="exclamation-triangle" />
                </div>
                Conflictos detectados
                <span class="tv__cardTitleBadge">{{ conflicts.length }} grupo(s)</span>
              </div>
            </template>
            <template #body>
              <div v-if="!conflicts.length" class="tv__conflictEmpty">
                <div class="tv__conflictEmptyIcon">
                  <AppIcon icon="check-circle" />
                </div>
                <div>
                  <div class="tv__conflictEmptyTitle">No se registraron conflictos</div>
                  <p class="tv__conflictEmptyText">El horario no reporta cursos sin asignar, coberturas parciales ni rechazos de validación.</p>
                </div>
              </div>

              <div v-else class="tv__conflictList">
                <section v-for="conflict in conflicts" :key="conflict._id || `${conflict.type}-${conflict.message}`" class="tv__conflictBlock" :class="conflictBlockClass(conflict.type)">
                  <div class="tv__conflictHeader">
                    <div class="tv__conflictHeading">
                      <div class="tv__conflictHeadingTop">
                        <span class="tv__conflictType">{{ conflictTypeLabel(conflict.type) }}</span>
                        <span class="tv__conflictBadge">{{ conflictCaseCount(conflict) }} caso(s)</span>
                      </div>
                      <p class="tv__conflictMessage">{{ conflict.message }}</p>
                    </div>
                  </div>

                  <div v-if="conflict.entries?.length" class="tv__conflictEntryGroup">
                    <span class="tv__conflictSubLabel">Entradas relacionadas</span>
                    <div class="tv__conflictEntryList">
                      <span v-for="entry in conflict.entries" :key="entry" class="tv__conflictEntry">{{ entry }}</span>
                    </div>
                  </div>

                  <div v-if="conflict.details?.length" class="tv__conflictDetailList">
                    <article v-for="detail in conflict.details" :key="`${detail.courseId}-${detail.nrc}`" class="tv__conflictDetail">
                      <div class="tv__conflictDetailTop">
                        <div class="tv__conflictDetailHeading">
                          <strong class="tv__conflictDetailCourse">{{ detail.courseName || detail.courseId || 'Curso sin nombre' }}</strong>
                          <span class="tv__conflictDetailMeta">
                            {{ detail.nrc || 'Sin NRC' }}
                            <span v-if="detail.courseId">· {{ detail.courseId }}</span>
                          </span>
                        </div>

                        <div class="tv__conflictMetricRow">
                          <span class="tv__conflictMetric">Esperado {{ metricValue(detail.expected) }}</span>
                          <span class="tv__conflictMetric">Asignado {{ metricValue(detail.actual) }}</span>
                          <span class="tv__conflictMetric">Intentado {{ metricValue(detail.attempted) }}</span>
                          <span v-if="metricValue(detail.rejected) > 0" class="tv__conflictMetric tv__conflictMetric--danger">Rechazado {{ metricValue(detail.rejected) }}</span>
                        </div>
                      </div>

                      <div class="tv__coverageRow">
                        <span class="tv__coverageLabel">Cobertura</span>
                        <strong class="tv__coverageValue">{{ coverageLabel(detail) }}</strong>
                      </div>

                      <ul v-if="detail.reasons?.length" class="tv__reasonList">
                        <li v-for="(reason, index) in detail.reasons" :key="`${detail.courseId}-${index}`">
                          {{ reason }}
                        </li>
                      </ul>
                    </article>
                  </div>
                </section>
              </div>
            </template>
          </AppCard>

          <AppCard v-else>
            <template #title>
              <div class="tv__cardTitle">
                <div class="tv__cardTitleIcon"><AppIcon icon="list" /></div>
                Detalle de asignaciones
                <span class="tv__cardTitleBadge">{{ schedule.length }} bloques</span>
              </div>
            </template>
            <template #body>
              <div class="tv__tableWrapper">
                <table class="tv__table">
                  <thead>
                    <tr>
                      <th>NRC</th>
                      <th>Asignatura</th>
                      <th>Docente</th>
                      <th>Día</th>
                      <th>Horario</th>
                      <th>Aula</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, i) in paginatedSchedule" :key="`${item.courseId}-${item.nrc}-${item.day}-${item.timeSlot}-${i}`">
                      <td>
                        <span class="tv__nrc">{{ item.nrc }}</span>
                      </td>
                      <td>
                        <div class="fw-semibold">{{ item.courseName }}</div>
                        <small class="text-muted">{{ item.courseCode }}</small>
                      </td>
                      <td>{{ item.facultyName }}</td>
                      <td>{{ dayLabel(item.day) }}</td>
                      <td class="tv__timeSlot">{{ item.timeSlot }}</td>
                      <td>{{ item.roomName }}</td>
                      <td>
                        <span class="tv__roomBadge" :class="roomTypeClass(item.roomType)">
                          {{ item.roomType }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="detailTotal > 0" class="tv__tablePagination">
                <span class="tv__tablePaginationInfo">{{ detailRecordStart }}-{{ detailRecordEnd }} de {{ detailTotal }} bloques</span>
                <AppPagination :total="detailTotal" :current="detailCurrentPage" :per-page="detailPerPage" :loading="false" class="border-0" @update:current="detailCurrentPage = $event" />
              </div>
            </template>
          </AppCard>

          <section class="tv__stepActions">
            <AppButton variant="secondary" outlined :disabled="currentStep === 1" @click="goToPreviousStep">
              <AppIcon icon="chevron-left" class="me-2" />
              Anterior
            </AppButton>

            <AppButton variant="primary" :disabled="currentStep === wizardSteps.length" @click="goToNextStep">
              Siguiente
              <AppIcon icon="chevron-right" class="ms-2" />
            </AppButton>
          </section>
        </div>
        <!-- /containerCards -->
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppPagination from '../../../shared/components/AppPagination.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppWizardStepper from '../../../shared/components/Stepper/AppWizardStepper.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { GetTimetableByIdService } from '../services/getTimetableById.service';
import { GenerateTimetableService } from '../services/generateTimetable.service';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import { ToastService } from '../../../shared/services/toast.service';

const getTimetableByIdService = new GetTimetableByIdService();
const generateTimetableService = new GenerateTimetableService();
const institutionsService = new InstitutionsService();
const toastService = new ToastService();

const DAY_LABELS: Record<string, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  unassigned_courses: 'Cursos sin asignar',
  partial_courses: 'Asignación parcial',
  validation_rejections: 'Rechazos de validación',
};

type TimetableUtilizationReference = {
  scheduledHours?: number | null;
  totalRoomSlots?: number | null;
};

type TimetableMetadata = {
  totalHours?: number | null;
  utilizationRate?: number | null;
  utilizationRateUnit?: string | null;
  utilizationRateLabel?: string | null;
  schedulingDays?: string[] | null;
  calendarDays?: string[] | null;
  utilizationReference?: TimetableUtilizationReference | null;
  institutionId?: string | number | null;
  curriculumOfferingId?: string | number | null;
  conflictCount?: number | null;
};

type TimetableScheduleEntry = {
  courseId: string;
  courseName?: string | null;
  courseCode?: string | null;
  subjectId?: string | null;
  sectionId?: string | null;
  nrc?: string | null;
  facultyId?: string | null;
  facultyName?: string | null;
  roomId?: string | null;
  roomName?: string | null;
  roomType?: string | null;
  type?: string | null;
  day: string;
  startTime?: string | null;
  endTime?: string | null;
  timeSlot?: string | null;
};

type TimetableConflictDetail = {
  courseId?: string | null;
  courseName?: string | null;
  nrc?: string | null;
  expected?: number | null;
  actual?: number | null;
  attempted?: number | null;
  rejected?: number | null;
  reasons?: string[] | null;
};

type TimetableConflict = {
  _id?: string;
  type: string;
  message: string;
  entries?: string[] | null;
  details?: TimetableConflictDetail[] | null;
};

type TimetableView = {
  metadata?: TimetableMetadata | null;
  id?: string | number | null;
  _id?: string;
  name: string;
  institutionId?: string | number | null;
  curriculumOfferingId?: string | number | null;
  semester?: string | null;
  year?: number | null;
  department?: string | null;
  schedule?: TimetableScheduleEntry[] | null;
  status?: string | null;
  conflicts?: TimetableConflict[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  __v?: number;
};

type InfoItem = {
  label: string;
  value: string;
  helper?: string;
};

type WizardStepDefinition = {
  id: number;
  title: string;
  icon: string;
  description: string;
};

const toSafeNumber = (value: unknown) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getDayOrderIndex = (day: string) => {
  const index = DAY_ORDER.indexOf(day);
  return index === -1 ? DAY_ORDER.length : index;
};

const formatSimpleText = (value?: string | null) => {
  if (!value) return 'No disponible';
  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDateTimeLabel = (value?: string | null) => {
  if (!value) return 'Sin fecha';

  const parsedDate = dayjs(value);
  if (!parsedDate.isValid()) return value;

  return parsedDate.format('DD/MM/YYYY HH:mm');
};

const formatDayList = (days: string[]) => {
  if (!days.length) return 'No disponible';
  return days.map((day) => DAY_LABELS[day] ?? day).join(', ');
};

const normalizePayloadId = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue || null;
  }

  return null;
};

const normalizeNumericPayloadId = (value: unknown) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getResponseTimetable = (response: unknown) => {
  const responseData = response as { data?: unknown };
  return (responseData?.data ?? response) as TimetableView | null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return responseMessage || fallback;
};

export default defineComponent({
  name: 'TimetableViewPage',
  components: {
    AppBaseList,
    AppButton,
    AppCard,
    AppIcon,
    AppButtonBack,
    AppLoading,
    AppPagination,
    AppWizardStepper,
  },

  setup() {
    const headerStorage = useHeaderStore();
    const route = useRoute();
    useMeta({ title: 'Ver horario' });

    const routes = [
      {
        name: 'Gestión de carga académica',
        url: { name: 'academicPlanning.loadManagement' },
      },
      { name: 'Ver horario' },
    ];

    const timetable = ref<TimetableView | null>(null);
    const isLoading = ref(false);
    const loadError = ref('');
    const currentStep = ref(1);
    const detailCurrentPage = ref(1);
    const detailPerPage = ref(10);
    const aiQuery = ref('');
    const isGeneratingAiTimetable = ref(false);
    const aiGenerationError = ref('');

    const wizardSteps = computed<WizardStepDefinition[]>(() => [
      {
        id: 1,
        title: 'Resumen',
        icon: 'chart-bar',
        description: 'Consulta los indicadores principales, la información base y el contexto general del horario.',
      },
      {
        id: 2,
        title: 'Horario',
        icon: 'table',
        description: 'Explora la distribución semanal de bloques por día, hora, aula y docente.',
      },
      {
        id: 3,
        title: 'Conflictos',
        icon: 'exclamation-triangle',
        description: 'Revisa los cursos sin asignación, coberturas parciales y validaciones pendientes.',
      },
      {
        id: 4,
        title: 'Asignaciones',
        icon: 'list',
        description: 'Consulta el detalle paginado de todos los bloques programados.',
      },
    ]);

    onMounted(async () => {
      headerStorage.module = { name: 'Planeación académica', url: '' };
      headerStorage.moduleItem = {
        name: 'Gestión de carga académica',
        url: '',
      };
      headerStorage.moduleSubItem = { name: 'Ver horario', url: '' };

      isLoading.value = true;
      loadError.value = '';

      try {
        const rawTimetable = window.history.state?.timetable;
        if (rawTimetable) {
          try {
            timetable.value = (typeof rawTimetable === 'string' ? JSON.parse(rawTimetable) : rawTimetable) as TimetableView;
          } catch (error) {
            console.warn('[TimetableViewPage] Invalid timetable state:', error);
          }
        }

        const id = (route.params.id ?? route.params.timetableId) as string | undefined;
        if (id) {
          const res = await getTimetableByIdService.run(id);
          timetable.value = (res?.data ?? res) as TimetableView;
        }

        if (!timetable.value) {
          loadError.value = 'No se encontraron datos del horario.';
        }
      } catch (error) {
        console.error('[TimetableViewPage] Error loading timetable:', error);
        timetable.value = null;
        loadError.value = 'No fue posible cargar el horario.';
      } finally {
        isLoading.value = false;
      }
    });

    const pageTitle = computed(() => timetable.value?.name ?? 'Visualización de horario');

    const metadata = computed<TimetableMetadata>(() => timetable.value?.metadata ?? {});
    const aiQueryTrimmed = computed(() => aiQuery.value.trim());
    const canGenerateWithAi = computed(() => Boolean(aiQueryTrimmed.value) && !isGeneratingAiTimetable.value && Boolean(timetable.value));

    const schedule = computed<TimetableScheduleEntry[]>(() => {
      const entries = Array.isArray(timetable.value?.schedule) ? [...timetable.value.schedule] : [];

      return entries.sort((first, second) => {
        const dayDiff = getDayOrderIndex(first.day) - getDayOrderIndex(second.day);
        if (dayDiff !== 0) return dayDiff;

        const firstSlot = first.timeSlot || `${first.startTime || ''}-${first.endTime || ''}`;
        const secondSlot = second.timeSlot || `${second.startTime || ''}-${second.endTime || ''}`;
        const slotDiff = firstSlot.localeCompare(secondSlot);
        if (slotDiff !== 0) return slotDiff;

        return String(first.courseName || '').localeCompare(String(second.courseName || ''));
      });
    });

    const conflicts = computed<TimetableConflict[]>(() => (Array.isArray(timetable.value?.conflicts) ? timetable.value?.conflicts : []));

    const schedulingDays = computed<string[]>(() => {
      const metaDays: string[] = Array.isArray(metadata.value.schedulingDays) ? metadata.value.schedulingDays : [];
      const days = metaDays.length ? metaDays : [...new Set(schedule.value.map((s) => s.day))];
      return [...days].sort((a, b) => getDayOrderIndex(a) - getDayOrderIndex(b));
    });

    const timeSlots = computed<string[]>(() => {
      const slots = [...new Set(schedule.value.map((s) => s.timeSlot || `${s.startTime || ''}-${s.endTime || ''}`).filter((slot) => Boolean(slot)))];
      return slots.sort((a, b) => a.localeCompare(b));
    });

    const conflictCount = computed(() => toSafeNumber(metadata.value.conflictCount ?? conflicts.value.length));

    const uniqueCourses = computed(() => new Set(schedule.value.map((s) => s.subjectId || s.courseId).filter((courseId) => Boolean(courseId))).size);
    const uniqueFaculty = computed(() => new Set(schedule.value.map((s) => s.facultyId).filter((facultyId) => Boolean(facultyId))).size);
    const uniqueRooms = computed(() => new Set(schedule.value.map((s) => s.roomId).filter((roomId) => Boolean(roomId))).size);
    const detailTotal = computed(() => schedule.value.length);
    const paginatedSchedule = computed(() => {
      const start = (detailCurrentPage.value - 1) * detailPerPage.value;
      return schedule.value.slice(start, start + detailPerPage.value);
    });
    const detailRecordStart = computed(() => (detailTotal.value === 0 ? 0 : (detailCurrentPage.value - 1) * detailPerPage.value + 1));
    const detailRecordEnd = computed(() => Math.min(detailCurrentPage.value * detailPerPage.value, detailTotal.value));
    const currentStepMeta = computed(() => wizardSteps.value.find((step) => step.id === currentStep.value) || wizardSteps.value[0]);

    const statusLabel = computed(() => {
      const status = String(timetable.value?.status || 'draft');
      return STATUS_LABELS[status] || formatSimpleText(status);
    });

    const semesterLabel = computed(() => {
      const semester = String(timetable.value?.semester || '').trim();
      if (!semester || semester === 'N/A') return 'No aplica';
      return semester;
    });

    const infoItems = computed<InfoItem[]>(() => {
      const utilizationReference = metadata.value.utilizationReference ?? {};
      const institutionId = metadata.value.institutionId ?? timetable.value?.institutionId;
      const curriculumOfferingId = metadata.value.curriculumOfferingId ?? timetable.value?.curriculumOfferingId;
      const calendarDays = Array.isArray(metadata.value.calendarDays) ? metadata.value.calendarDays : [];
      const utilizationLabel = metadata.value.utilizationRateLabel || `${toSafeNumber(metadata.value.utilizationRate).toFixed(2)}%`;
      const scheduledHours = toSafeNumber(utilizationReference.scheduledHours ?? metadata.value.totalHours);
      const totalRoomSlots = toSafeNumber(utilizationReference.totalRoomSlots);

      return [
        {
          label: 'Estado',
          value: statusLabel.value,
          helper: `Actualizado ${formatDateTimeLabel(timetable.value?.updatedAt)}`,
        },
        {
          label: 'Semestre y año',
          value: `${semesterLabel.value} · ${timetable.value?.year ?? 'Sin año'}`,
          helper: `Creado ${formatDateTimeLabel(timetable.value?.createdAt)}`,
        },
        {
          label: 'Oferta curricular',
          value: curriculumOfferingId ? String(curriculumOfferingId) : 'No disponible',
          helper: institutionId ? `Institución ${institutionId}` : 'Institución no disponible',
        },
        {
          label: 'Días programados',
          value: formatDayList(schedulingDays.value),
          helper: `Calendario: ${formatDayList(calendarDays)}`,
        },
        {
          label: 'Utilización',
          value: utilizationLabel,
          helper: `${scheduledHours} horas asignadas de ${totalRoomSlots} espacios-hora`,
        },
        {
          label: 'Cobertura actual',
          value: `${schedule.value.length} bloques`,
          helper: `${uniqueCourses.value} asignaturas · ${uniqueFaculty.value} docentes · ${uniqueRooms.value} aulas`,
        },
      ];
    });

    const getCourses = (day: string, slot: string) => schedule.value.filter((item) => item.day === day && (item.timeSlot || `${item.startTime || ''}-${item.endTime || ''}`) === slot);

    const dayLabel = (day: string) => DAY_LABELS[day] ?? day;

    const roomTypeClass = (type?: string) => {
      const t = (type ?? '').toLowerCase();
      if (t.includes('laboratorio')) return 'tv__courseCard--lab';
      if (t.includes('tecnol') || t.includes('digital')) return 'tv__courseCard--tech';
      return 'tv__courseCard--trad';
    };

    const conflictTypeLabel = (type: string) => CONFLICT_TYPE_LABELS[type] || formatSimpleText(type);

    const conflictBlockClass = (type: string) => {
      switch (type) {
        case 'unassigned_courses':
          return 'tv__conflictBlock--critical';
        case 'partial_courses':
          return 'tv__conflictBlock--warning';
        case 'validation_rejections':
          return 'tv__conflictBlock--info';
        default:
          return 'tv__conflictBlock--neutral';
      }
    };

    const conflictCaseCount = (conflict: TimetableConflict) => {
      const detailCount = Array.isArray(conflict.details) ? conflict.details.length : 0;
      const entryCount = Array.isArray(conflict.entries) ? conflict.entries.length : 0;
      return detailCount || entryCount || 1;
    };

    const metricValue = (value: unknown) => toSafeNumber(value);

    const coverageLabel = (detail: TimetableConflictDetail) => {
      const actual = metricValue(detail.actual);
      const expected = metricValue(detail.expected);

      if (!expected) return `${actual} asignada(s)`;

      const percentage = Math.round((actual / expected) * 100);
      return `${actual}/${expected} (${percentage}%)`;
    };

    const goToPreviousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value -= 1;
      }
    };

    const goToNextStep = () => {
      if (currentStep.value < wizardSteps.value.length) {
        currentStep.value += 1;
      }
    };

    const generateTimetableWithAi = async () => {
      aiGenerationError.value = '';

      if (!aiQueryTrimmed.value) {
        aiGenerationError.value = 'Describe el ajuste que quieres aplicar al horario.';
        return;
      }

      const institutionId = normalizeNumericPayloadId(
        metadata.value.institutionId ?? timetable.value?.institutionId ?? institutionsService.getSelectedInstitution()?.id ?? localStorage.getItem('institutionId')
      );
      const curriculumOfferingId = normalizeNumericPayloadId(metadata.value.curriculumOfferingId ?? timetable.value?.curriculumOfferingId);
      const timetableId = normalizePayloadId(timetable.value?._id ?? timetable.value?.id ?? route.params.id ?? route.params.timetableId);

      if (institutionId == null || curriculumOfferingId == null || timetableId == null) {
        aiGenerationError.value = 'No fue posible identificar la institución, la oferta curricular o el horario.';
        toastService.show(aiGenerationError.value, 'error');
        return;
      }

      isGeneratingAiTimetable.value = true;

      try {
        const response = await generateTimetableService.run({
          institutionId,
          curriculumOfferingId,
          timetableId,
          query: aiQueryTrimmed.value,
        });

        const generatedTimetable = getResponseTimetable(response);

        if (generatedTimetable && (generatedTimetable._id || generatedTimetable.id || Array.isArray(generatedTimetable.schedule))) {
          timetable.value = generatedTimetable;
        } else {
          const refreshedTimetable = await getTimetableByIdService.run(timetableId);
          timetable.value = getResponseTimetable(refreshedTimetable);
        }

        aiQuery.value = '';
        detailCurrentPage.value = 1;
        currentStep.value = 2;
        toastService.show('Horario generado correctamente.', 'success');
      } catch (error) {
        const message = getErrorMessage(error, 'No fue posible generar el horario. Intenta nuevamente.');
        aiGenerationError.value = message;
        toastService.show(message, 'error');
        console.error('[TimetableViewPage] generateTimetableWithAi:', error);
      } finally {
        isGeneratingAiTimetable.value = false;
      }
    };

    watch(
      () => detailTotal.value,
      (total) => {
        const maxPage = Math.max(1, Math.ceil(total / detailPerPage.value));
        if (detailCurrentPage.value > maxPage) {
          detailCurrentPage.value = maxPage;
        }
      }
    );

    return {
      routes,
      pageTitle,
      timetable,
      isLoading,
      loadError,
      schedule,
      conflicts,
      schedulingDays,
      timeSlots,
      aiQuery,
      aiGenerationError,
      canGenerateWithAi,
      isGeneratingAiTimetable,
      currentStep,
      wizardSteps,
      currentStepMeta,
      detailCurrentPage,
      detailPerPage,
      detailTotal,
      paginatedSchedule,
      detailRecordStart,
      detailRecordEnd,
      conflictCount,
      uniqueCourses,
      infoItems,
      getCourses,
      dayLabel,
      roomTypeClass,
      conflictTypeLabel,
      conflictBlockClass,
      conflictCaseCount,
      metricValue,
      coverageLabel,
      goToPreviousStep,
      goToNextStep,
      generateTimetableWithAi,
    };
  },
});
</script>

<style scoped>
/* ── Container ── */
.containerCards {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tv__stepIntro {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.tv__stepKicker {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #2563eb;
}

.tv__stepTitle {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.tv__stepDescription {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: #475569;
}

.tv__stepActions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

/* ── Top grid: info + IA side by side ── */
.tv__topGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: stretch;
}

/* ── No data ── */
.tv__noData {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: #94a3b8;
  font-size: 0.95rem;
}
.tv__noDataIcon {
  font-size: 2rem;
  width: 4.5rem;
  height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f1f5f9;
}

/* ── Card title slot shared style ── */
.tv__cardTitle {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}
.tv__cardTitleIcon {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.875rem;
}
.tv__cardTitleBadge {
  margin-left: auto;
  padding: 0.2rem 0.625rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
}

/* ── Header info card ── */
.tv__title {
  font-size: 0.975rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.15rem;
}
.tv__subtitle {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

/* ── Stats ── */
.tv__statsRow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}
.tv__statCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.875rem 0.625rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.tv__statCard--blue {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.tv__statCard--green {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.tv__statCard--red {
  background: #fff1f2;
  border-color: #fecdd3;
}
.tv__statCard--gray {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.tv__statCard--purple {
  background: #f5f3ff;
  border-color: #ddd6fe;
}

.tv__statValue {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}
.tv__statLabel {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
  text-align: center;
}

/* ── AI card ── */

.tv__aiCardTitle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.tv__aiIconWrap {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-size: 0.875rem;
}
.tv__aiTitle {
  font-size: 0.975rem;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0 0 0.15rem;
}
.tv__aiDescription {
  font-size: 0.78rem;
  color: #6366f1;
  margin: 0;
  font-weight: 400;
}

.tv__aiTextarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #c7d2fe;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #1e1b4b;
  background: rgba(255, 255, 255, 0.8);
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.tv__aiTextarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
.tv__aiTextarea:disabled {
  color: #64748b;
  background: #f8fafc;
  cursor: wait;
}

.tv__aiFooter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 0.875rem;
  gap: 0.75rem;
}
.tv__aiMessage {
  flex: 1;
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.4;
}
.tv__aiMessage--error {
  color: #b91c1c;
}
.tv__aiComingSoon {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: #818cf8;
  font-style: italic;
  margin: 0;
}
.tv__aiBtn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  background: #4f46e5;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.tv__aiBtn:hover:not(:disabled) {
  background: #4338ca;
  box-shadow: 0 0.6rem 1.25rem rgba(79, 70, 229, 0.22);
  transform: translateY(-1px);
}
.tv__aiBtn:disabled {
  background: #e0e7ff;
  color: #a5b4fc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* ── Grid ── */
.tv__gridWrapper {
  height: 620px;
  overflow: auto;
  scrollbar-gutter: stable;
}
.tv__grid {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  font-size: 0.8rem;
}
.tv__timeHeader {
  padding: 0.6rem 0.75rem;
  background: #1e3a8a;
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  text-align: center;
  white-space: nowrap;
  position: sticky;
  left: 0;
  z-index: 2;
  min-width: 80px;
}
.tv__dayHeader {
  padding: 0.6rem 0.5rem;
  background: #1e3a8a;
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  text-align: center;
  min-width: 140px;
}
.tv__timeCell {
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.75rem;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #e2e8f0;
  position: sticky;
  left: 0;
  z-index: 1;
}
.tv__cell {
  border: 1px solid #e2e8f0;
  vertical-align: top;
  padding: 0.3rem;
  min-height: 3rem;
}

/* ── Course cards inside grid ── */
.tv__courseCard {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.72rem;
  line-height: 1.3;
  cursor: default;
}
.tv__courseCard--trad {
  background: #dbeafe;
  border-left: 3px solid #3b82f6;
}
.tv__courseCard--tech {
  background: #ede9fe;
  border-left: 3px solid #8b5cf6;
}
.tv__courseCard--lab {
  background: #dcfce7;
  border-left: 3px solid #22c55e;
}

.tv__courseCode {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.68rem;
  text-transform: uppercase;
}
.tv__courseName {
  font-weight: 600;
  color: #1e40af;
  line-height: 1.2;
}
.tv__courseRoom,
.tv__courseFaculty {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #64748b;
  font-size: 0.68rem;
}
.tv__courseRoomIcon {
  font-size: 0.6rem;
  flex-shrink: 0;
}

/* ── Legend ── */
.tv__legend {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}
.tv__legendItem {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}
.tv__legendItem--trad {
  background: #dbeafe;
  color: #1d4ed8;
}
.tv__legendItem--tech {
  background: #ede9fe;
  color: #7c3aed;
}
.tv__legendItem--lab {
  background: #dcfce7;
  color: #15803d;
}

/* ── Extra info ── */
.tv__infoGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}
.tv__infoItem {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  min-width: 0;
}
.tv__infoLabel {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #64748b;
}
.tv__infoValue {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  color: #0f172a;
  word-break: break-word;
}
.tv__infoHelper {
  font-size: 0.78rem;
  line-height: 1.4;
  color: #475569;
  word-break: break-word;
}

/* ── Conflicts ── */
.tv__conflictEmpty {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f0fdf4;
}
.tv__conflictEmptyIcon {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  flex-shrink: 0;
}
.tv__conflictEmptyTitle {
  font-size: 0.92rem;
  font-weight: 700;
  color: #166534;
}
.tv__conflictEmptyText {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #166534;
  line-height: 1.45;
}
.tv__conflictList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.tv__conflictBlock {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}
.tv__conflictBlock--critical {
  background: #fff7f8;
  border-color: #fecdd3;
}
.tv__conflictBlock--warning {
  background: #fff7ed;
  border-color: #fed7aa;
}
.tv__conflictBlock--info {
  background: #f5f3ff;
  border-color: #c7d2fe;
}
.tv__conflictBlock--neutral {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.tv__conflictHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.tv__conflictHeading {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}
.tv__conflictHeadingTop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.tv__conflictType {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}
.tv__conflictBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.35);
}
.tv__conflictMessage {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #475569;
}
.tv__conflictEntryGroup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.tv__conflictSubLabel {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #64748b;
}
.tv__conflictEntryList {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.tv__conflictEntry {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
  color: #334155;
  background: #ffffff;
  border: 1px solid #cbd5e1;
}
.tv__conflictDetailList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.tv__conflictDetail {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.9rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.95);
}
.tv__conflictDetailTop {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.tv__conflictDetailHeading {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.tv__conflictDetailCourse {
  font-size: 0.9rem;
  line-height: 1.35;
  color: #0f172a;
}
.tv__conflictDetailMeta {
  font-size: 0.76rem;
  color: #64748b;
}
.tv__conflictMetricRow {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.tv__conflictMetric {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #4338ca;
  background: #eef2ff;
}
.tv__conflictMetric--danger {
  color: #be123c;
  background: #ffe4e6;
}
.tv__coverageRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.35rem;
  border-top: 1px dashed #cbd5e1;
  flex-wrap: wrap;
}
.tv__coverageLabel {
  font-size: 0.76rem;
  font-weight: 600;
  color: #64748b;
}
.tv__coverageValue {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}
.tv__reasonList {
  margin: 0;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  line-height: 1.45;
  color: #475569;
}

/* ── Detail table ── */
.tv__tableWrapper {
  overflow-x: auto;
}
.tv__tablePagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.9rem;
  flex-wrap: wrap;
}
.tv__tablePaginationInfo {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 600;
}
.tv__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 700px;
}
.tv__table th {
  padding: 0.7rem 1rem;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
  white-space: nowrap;
}
.tv__table td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
  vertical-align: middle;
}
.tv__table tr:hover td {
  background: #f8fafc;
}

.tv__nrc {
  display: inline-flex;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  background: #e0e7ff;
  color: #3730a3;
  font-weight: 600;
  font-size: 0.78rem;
  white-space: nowrap;
}
.tv__timeSlot {
  white-space: nowrap;
  font-weight: 600;
  color: #475569;
}

.tv__roomBadge {
  display: inline-flex;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.tv__roomBadge.tv__courseCard--trad {
  background: #dbeafe;
  color: #1d4ed8;
}
.tv__roomBadge.tv__courseCard--tech {
  background: #ede9fe;
  color: #7c3aed;
}
.tv__roomBadge.tv__courseCard--lab {
  background: #dcfce7;
  color: #15803d;
}

@media (max-width: 1024px) {
  .tv__topGrid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1200px) {
  .tv__conflictList {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
  .tv__conflictBlock--critical,
  .tv__conflictBlock--warning {
    height: 560px;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }
  .tv__conflictBlock--info,
  .tv__conflictBlock--neutral {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .tv__statsRow {
    grid-template-columns: 1fr 1fr;
  }
  .tv__stepActions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
  .tv__tablePagination {
    flex-direction: column;
    align-items: stretch;
  }
  .tv__conflictHeader {
    flex-direction: column;
  }
  .tv__conflictMetricRow {
    justify-content: flex-start;
  }
  .tv__gridWrapper {
    height: 480px;
  }
}
</style>
