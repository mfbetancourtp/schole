<template>
  <AppLoading v-if="loading" />

  <div v-else class="modern-exam-step">
    <AppCard class="modern-exam-step__shell">
      <template #body>
        <RegistrationModernHelpAccordion :description="resolvedHelpDescription" :video-url="resolvedTutorialVideoUrl" :default-open="false" />

        <section :class="['modern-exam-step__hero', { 'modern-exam-step__hero--completed': examState === 'completed' }]">
          <div
            :class="[
              'modern-exam-step__heroIcon',
              {
                'modern-exam-step__heroIcon--completed': examState === 'completed',
              },
            ]"
          >
            <AppIcon :icon="examState === 'completed' ? 'check-circle' : 'tasks'" />
          </div>

          <div class="modern-exam-step__heroCopy">
            <span class="modern-exam-step__eyebrow">
              {{ examEyebrow }}
            </span>
            <h2>{{ examTitle }}</h2>
            <p>{{ examSubtitle }}</p>
          </div>

          <div class="modern-exam-step__heroStatus">
            <strong>{{ examStateLabel }}</strong>
            <span>{{ answeredCount }} / {{ totalQuestions }} respondidas</span>
            <div class="modern-exam-step__heroProgress">
              <div class="modern-exam-step__heroProgressBar" :style="{ width: `${progressPercentage}%` }"></div>
            </div>
            <small>{{ progressPercentage }}% de avance</small>
          </div>
        </section>

        <section v-if="examContext" class="modern-exam-step__detailPanel">
          <div v-for="item in examDetailItems" :key="item.label" class="modern-exam-step__detailCard">
            <div :class="['modern-exam-step__detailIcon', `modern-exam-step__detailIcon--${item.tone}`]">
              <AppIcon :icon="item.icon" />
            </div>

            <div class="modern-exam-step__detailCopy">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <small>{{ item.meta }}</small>
            </div>
          </div>
        </section>

        <section v-if="loadError" class="modern-exam-step__stateBox modern-exam-step__stateBox--danger">
          <AppIcon icon="exclamation-circle" />

          <div>
            <strong>No pudimos preparar el examen</strong>
            <p>{{ loadError }}</p>
          </div>
        </section>

        <template v-else>
          <section class="modern-exam-step__stats">
            <AppStatCard
              v-for="card in summaryCards"
              :key="card.label"
              :label="card.label"
              :value="card.value"
              :caption="card.caption"
              :icon="card.icon"
              :variant="card.variant"
              :value-size="card.valueSize ?? 'md'"
            />
          </section>

          <section v-if="isFinalAttempt" class="modern-exam-step__resultPanel">
            <header class="modern-exam-step__sectionHeader">
              <div>
                <span class="modern-exam-step__sectionEyebrow modern-exam-step__sectionEyebrow--success">Resultado</span>
                <h3>Resultado del examen</h3>
                <p class="modern-exam-step__sectionDescription">
                  {{ resultSummaryDescription }}
                </p>
              </div>
            </header>

            <div class="modern-exam-step__resultGrid">
              <AppStatCard
                v-for="card in resultCards"
                :key="card.label"
                :label="card.label"
                :value="card.value"
                :caption="card.caption"
                :icon="card.icon"
                :variant="card.variant"
                :value-size="card.valueSize ?? 'md'"
              />
            </div>
          </section>

          <section v-if="!isFinalAttempt" class="modern-exam-step__instructions">
            <header class="modern-exam-step__sectionHeader">
              <div>
                <span class="modern-exam-step__sectionEyebrow">Ruta recomendada</span>
                <h3>Antes de comenzar</h3>
                <p class="modern-exam-step__sectionDescription">Ten claro el contexto del checklist y entra cuando dispongas del tiempo completo para responder.</p>
              </div>
            </header>

            <div v-for="(instruction, index) in instructionItems" :key="instruction.title" class="modern-exam-step__instructionItem">
              <span class="modern-exam-step__instructionIndex">{{ index + 1 }}</span>
              <div class="modern-exam-step__instructionCopy">
                <strong>{{ instruction.title }}</strong>
                <p>{{ instruction.description }}</p>
              </div>
            </div>
          </section>

          <section v-if="!isFinalAttempt" class="modern-exam-step__stateBox modern-exam-step__stateBox--info">
            <AppIcon icon="info-circle" />

            <div>
              <strong>{{ stateBoxTitle }}</strong>
              <p>{{ stateBoxDescription }}</p>
            </div>
          </section>

          <section v-if="!isFinalAttempt" class="modern-exam-step__cta">
            <div class="modern-exam-step__ctaCopy">
              <span class="modern-exam-step__sectionEyebrow modern-exam-step__sectionEyebrow--success">Siguiente paso</span>
              <h3>{{ actionTitle }}</h3>
              <p>{{ actionDescription }}</p>
            </div>

            <AppButton class="modern-exam-step__startButton" :disabled="startingExam" @click="goToExamPage">
              <AppIcon :icon="actionButtonIcon" class="me-2" />
              {{ startingExam ? 'Preparando examen' : actionButtonLabel }}
            </AppButton>
          </section>
        </template>
      </template>
    </AppCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import RegistrationModernHelpAccordion from './RegistrationModernHelpAccordion.vue';
import type { StepDto } from '../dtos/convocationWithSteps.dto';
import type { ChecklistDiligenciadoDto } from '../dtos/checklistDiligenciado.dto';
import { GetRegistrationExamService } from '../services/getRegistrationExam.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { CreateChecklistDiligenciadoService } from '../services/createChecklistDiligenciado.service';
import { GetChecklistDiligenciadoService } from '../services/getChecklistDiligenciado.service';
import { StartChecklistDiligenciadoService } from '../services/startChecklistDiligenciado.service';
import {
  calculateRegistrationExamRemainingSeconds,
  formatRegistrationExamDuration,
  loadRegistrationExamProgress,
  mapRegistrationExamBackendStatusToState,
  normalizeRegistrationExamBackendStatus,
  parseRegistrationExamDurationSeconds,
  type RegistrationExamBackendStatus,
  type RegistrationExamState,
} from '../utils/registrationExam.utils';
import { normalizeRegistrationExamDefinition } from '../utils/registrationExam.mapper';
import { MODERN_REGISTRATION_EXAM_ROUTE_NAME, buildModernRegistrationQuery } from '../utils/registrationFlow.utils';

const getConvocationWithStepsService = new GetConvocationWithStepsService();
const getRegistrationExamService = new GetRegistrationExamService();
const createChecklistDiligenciadoService = new CreateChecklistDiligenciadoService();
const getChecklistDiligenciadoService = new GetChecklistDiligenciadoService();
const startChecklistDiligenciadoService = new StartChecklistDiligenciadoService();

interface ExamStepContext {
  curriculumOfferingId: number;
  checklistId: number;
  checklistTitle: string;
  programName: string;
  campusName: string;
  rowId?: number | string | null;
}

interface ExamDetailItem {
  label: string;
  value: string;
  meta: string;
  icon: string;
  tone: 'blue' | 'green' | 'yellow';
}

interface ExamSummaryCard {
  label: string;
  value: string | number;
  caption: string;
  icon: string;
  variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'white';
  valueSize?: 'xs' | 'sm' | 'md';
}

interface ExamInstructionItem {
  title: string;
  description: string;
}

const resolveExamContext = (detail?: StepDto['detail']): ExamStepContext | null => {
  if (Array.isArray(detail)) {
    return (detail[0] as ExamStepContext | undefined) ?? null;
  }

  return (detail as ExamStepContext | null | undefined) ?? null;
};

export default defineComponent({
  name: 'RegistrationModernExamStep',
  components: {
    AppButton,
    AppCard,
    AppIcon,
    AppLoading,
    AppStatCard,
    RegistrationModernHelpAccordion,
  },
  props: {
    embedded: {
      type: Boolean,
      default: true,
    },
    stepId: {
      type: Number,
      default: 0,
    },
    convocationId: {
      type: Number,
      default: 0,
    },
    convocationEnrolId: {
      type: Number,
      default: 0,
    },
    videoUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();

    const loading = ref(true);
    const startingExam = ref(false);
    const loadError = ref('');
    const step: Ref<StepDto | null> = ref(null);
    const examContext = ref<ExamStepContext | null>(null);
    const checklistAttempt = ref<ChecklistDiligenciadoDto | null>(null);
    const tutorialVideoUrl = ref('');
    const examDurationSeconds = ref(parseRegistrationExamDurationSeconds(null));
    const timeRemaining = ref(examDurationSeconds.value);
    const totalQuestions = ref(0);
    const totalSections = ref(0);
    const requiredQuestions = ref(0);
    const answeredCount = ref(0);
    const examState = ref<RegistrationExamState>('initial');
    const countdownTimerId = ref<number | null>(null);

    const parseRouteId = (param: unknown) => Number.parseInt(String(param ?? 0), 10) || 0;
    const parseNullableId = (value: unknown) => {
      const normalizedValue = Array.isArray(value) ? value[0] : value;
      const parsedValue = Number.parseInt(String(normalizedValue ?? ''), 10);

      return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
    };
    const resolveAuthenticatedUserId = () => {
      try {
        const rawUser = localStorage.getItem('user');
        const user = rawUser ? JSON.parse(rawUser) : null;

        return parseNullableId(user?.id ?? user?.people?.userId ?? user?.people?.user?.id);
      } catch {
        return 0;
      }
    };
    const resolveProgressNumber = (value: unknown, fallback: number) => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback);

    const stepId = computed(() => props.stepId || parseRouteId(route.params.stepId ?? route.query.stepId));
    const convocationId = computed(() => props.convocationId || parseRouteId(route.params.convocationId ?? route.query.convocationId));
    const convocationEnrolId = computed(() => props.convocationEnrolId || parseRouteId(route.params.convocationEnrollId ?? route.query.convocationEnrollId));
    const institutionId = computed(() => parseRouteId(route.params.institutionId ?? route.query.institutionId));
    const attemptStatus = computed<RegistrationExamBackendStatus>(() => normalizeRegistrationExamBackendStatus(checklistAttempt.value?.estado));
    const durationLabel = computed(() => formatRegistrationExamDuration(examDurationSeconds.value));
    const shouldShowRemainingTime = computed(() => attemptStatus.value === 'En progreso' && Boolean(checklistAttempt.value?.fechaInicio));
    const closedAttemptStatuses: RegistrationExamBackendStatus[] = ['Entregado', 'En revisión', 'Aprobado', 'Rechazado'];
    const isFinalAttempt = computed(() => closedAttemptStatuses.includes(attemptStatus.value) || examState.value === 'completed');

    const formatCountdown = (seconds: number) => {
      const safeSeconds = Math.max(Math.round(seconds), 0);
      const hours = Math.floor(safeSeconds / 3600);
      const minutes = Math.floor((safeSeconds % 3600) / 60);
      const remainingSeconds = safeSeconds % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };
    const formatAttemptDateTime = (value?: string | null) => {
      if (!value) return '';

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';

      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date);
    };
    const durationClockLabel = computed(() => formatCountdown(examDurationSeconds.value));
    const timeCardValue = computed(() => {
      if (shouldShowRemainingTime.value) return formatCountdown(timeRemaining.value);
      if (closedAttemptStatuses.includes(attemptStatus.value)) return attemptStatus.value;

      return durationClockLabel.value;
    });
    const timeCardCaption = computed(() => {
      if (shouldShowRemainingTime.value) {
        return timeRemaining.value > 0 ? 'Tiempo restante' : 'Tiempo agotado';
      }

      if (closedAttemptStatuses.includes(attemptStatus.value)) {
        const finishedAt = formatAttemptDateTime(checklistAttempt.value?.fechaFin);
        if (finishedAt) return `Finalizó ${finishedAt}`;

        const startedAt = formatAttemptDateTime(checklistAttempt.value?.fechaInicio);
        if (startedAt) return `Inició ${startedAt}`;

        return 'Estado del intento';
      }

      return 'Duración total';
    });
    const timeCardVariant = computed<ExamSummaryCard['variant']>(() => {
      if (shouldShowRemainingTime.value) {
        if (timeRemaining.value <= 0) return 'red';
        if (timeRemaining.value <= 300) return 'red';
        if (timeRemaining.value <= 900) return 'yellow';

        return 'green';
      }

      if (closedAttemptStatuses.includes(attemptStatus.value)) return 'gray';

      return 'yellow';
    });
    const formatScoreValue = (value?: number | null) => (typeof value === 'number' && Number.isFinite(value) ? Number(value.toFixed(2)).toString() : 'Pendiente');
    const formatPercentValue = (value?: number | null) => (typeof value === 'number' && Number.isFinite(value) ? `${Number(value.toFixed(2))}%` : 'Pendiente');
    const resultScoreLabel = computed(() => {
      const obtained = checklistAttempt.value?.puntajeObtenido;
      const total = checklistAttempt.value?.puntajeTotal;

      if (typeof obtained === 'number' && typeof total === 'number') return `${formatScoreValue(obtained)} / ${formatScoreValue(total)}`;
      if (typeof obtained === 'number') return formatScoreValue(obtained);

      return 'Pendiente';
    });
    const resultSummaryDescription = computed(() => {
      if (attemptStatus.value === 'Entregado') return 'Tu examen fue entregado correctamente. Estos son los datos registrados del intento.';
      if (attemptStatus.value === 'En revisión') return 'Tu examen ya fue entregado y se encuentra en revisión.';
      if (attemptStatus.value === 'Aprobado') return 'Tu examen fue aprobado. Estos son los datos registrados del intento.';
      if (attemptStatus.value === 'Rechazado') return 'Tu examen fue revisado y quedó rechazado.';

      return 'Estos son los datos registrados del intento.';
    });
    const resultCards = computed<ExamSummaryCard[]>(() => [
      {
        label: 'Nota',
        value: resultScoreLabel.value,
        caption: 'Puntaje obtenido',
        icon: 'star',
        variant: checklistAttempt.value?.puntajeObtenido == null ? 'gray' : 'green',
        valueSize: 'sm',
      },
      {
        label: 'Porcentaje',
        value: formatPercentValue(checklistAttempt.value?.porcentajePuntaje),
        caption: 'Resultado',
        icon: 'chart-line',
        variant: checklistAttempt.value?.porcentajePuntaje == null ? 'gray' : 'blue',
        valueSize: 'sm',
      },
      {
        label: 'Respondidas',
        value: `${resolveProgressNumber(checklistAttempt.value?.preguntasRespondidas, answeredCount.value)} / ${resolveProgressNumber(checklistAttempt.value?.totalPreguntas, totalQuestions.value)}`,
        caption: 'Preguntas del intento',
        icon: 'tasks',
        variant: 'white',
        valueSize: 'sm',
      },
      {
        label: 'Obligatorias',
        value: resolveProgressNumber(checklistAttempt.value?.obligatoriosSinHacer, 0),
        caption: 'Sin responder',
        icon: 'exclamation-circle',
        variant: checklistAttempt.value?.obligatoriosSinHacer ? 'red' : 'green',
      },
      {
        label: 'Entregado',
        value: formatAttemptDateTime(checklistAttempt.value?.fechaFin) || 'Sin fecha',
        caption: 'Fecha de cierre',
        icon: 'calendar-check',
        variant: 'gray',
        valueSize: 'xs',
      },
      {
        label: 'Estado',
        value: attemptStatus.value,
        caption: 'Estado actual',
        icon: 'check-circle',
        variant: attemptStatus.value === 'Rechazado' ? 'red' : attemptStatus.value === 'Aprobado' ? 'green' : 'yellow',
        valueSize: 'sm',
      },
    ]);

    const examTitle = computed(() => step.value?.title || examContext.value?.checklistTitle || 'Examen de evaluación');
    const examSubtitle = computed(() => 'Responde cada sección del examen para continuar con tu proceso de admisión.');
    const resolvedTutorialVideoUrl = computed(() => props.videoUrl || tutorialVideoUrl.value || String(step.value?.urlVideoConvocationStep ?? ''));
    const progressPercentage = computed(() => {
      if (!totalQuestions.value) return 0;

      return Math.round((answeredCount.value / totalQuestions.value) * 100);
    });
    const examEyebrow = computed(() => {
      if (checklistAttempt.value) return attemptStatus.value;
      if (examState.value === 'completed') return 'Examen completado';
      if (examState.value === 'active') return 'Examen en progreso';

      return 'Examen de evaluación';
    });
    const examStateLabel = computed(() => {
      if (checklistAttempt.value) return attemptStatus.value;
      if (examState.value === 'completed') return 'Completado';
      if (examState.value === 'active') return 'En progreso';

      return 'Pendiente';
    });
    const examDetailItems = computed<ExamDetailItem[]>(() => {
      if (!examContext.value) return [];

      return [
        {
          label: 'Checklist',
          value: examContext.value.checklistTitle,
          meta: '',
          icon: 'file-alt',
          tone: 'blue',
        },
        {
          label: 'Programa',
          value: examContext.value.programName,
          meta: '',
          icon: 'graduation-cap',
          tone: 'green',
        },
        {
          label: 'Sede',
          value: examContext.value.campusName,
          meta: '',
          icon: 'map-marker-alt',
          tone: 'yellow',
        },
      ];
    });
    const summaryCards = computed<ExamSummaryCard[]>(() => [
      {
        label: 'Preguntas',
        value: totalQuestions.value,
        caption: '',
        icon: 'question-circle',
        variant: 'blue',
      },
      {
        label: 'Secciones',
        value: totalSections.value,
        caption: '',
        icon: 'layer-group',
        variant: 'gray',
      },
      {
        label: 'Tiempo',
        value: timeCardValue.value,
        caption: timeCardCaption.value,
        icon: 'clock',
        variant: timeCardVariant.value,
        valueSize: 'sm',
      },
      {
        label: 'Obligatorias',
        value: requiredQuestions.value,
        caption: '',
        icon: 'check-circle',
        variant: examState.value === 'completed' ? 'green' : 'white',
      },
    ]);
    const defaultHelpDescription = computed(
      () =>
        'Este examen se abrirá en una interfaz dedicada.<br /><br />' +
        `• Dispondrás de ${durationLabel.value} para responderlo<br />` +
        `• Se han configurado ${totalQuestions.value || 0} preguntas distribuidas en ${totalSections.value || 0} secciones<br />` +
        '• El temporizador toma como referencia la fecha de inicio registrada para este intento<br />' +
        '• Tus respuestas se guardarán automáticamente durante el intento'
    );
    const resolvedHelpDescription = computed(() => String(step.value?.description || defaultHelpDescription.value).replace(/\n/g, '<br />'));
    const instructionItems = computed<ExamInstructionItem[]>(() => [
      {
        title: 'Prepara tu espacio',
        description: `Verifica tu conexión y responde desde un lugar tranquilo para evitar interrupciones durante ${durationLabel.value}.`,
      },
      {
        title: 'Lee cada bloque completo',
        description: 'Antes de responder, revisa las observaciones de la categoría para entender el contexto de cada sección.',
      },
      {
        title: 'Retoma si ya empezaste',
        description: 'Si tu intento quedó en progreso, podrás continuar desde el punto donde se guardó tu avance.',
      },
      {
        title: 'Cierra solo al revisar todo',
        description: 'Confirma tus respuestas antes de finalizar para evitar dejar preguntas obligatorias pendientes.',
      },
    ]);
    const actionTitle = computed(() => {
      if (attemptStatus.value === 'En progreso') return 'Tu intento sigue disponible para continuar';
      if (attemptStatus.value === 'Entregado') return 'Tu examen ya fue entregado';
      if (attemptStatus.value === 'En revisión') return 'Tu examen está en revisión';
      if (attemptStatus.value === 'Aprobado') return 'Tu examen fue aprobado';
      if (attemptStatus.value === 'Rechazado') return 'Tu examen fue rechazado';
      if (examState.value === 'completed') return 'Tu examen ya figura como completado';
      if (examState.value === 'active') return 'Tu intento sigue disponible para continuar';

      return 'Todo listo para iniciar tu evaluación';
    });
    const actionDescription = computed(() => {
      if (attemptStatus.value === 'En progreso') {
        return 'Entra de nuevo para retomar el examen con tu progreso guardado y continuar donde quedaste.';
      }

      if (['Entregado', 'En revisión', 'Aprobado', 'Rechazado'].includes(attemptStatus.value)) {
        return 'Puedes ingresar nuevamente para revisar el contenido del examen y validar la información registrada.';
      }

      if (examState.value === 'completed') {
        return 'Puedes ingresar nuevamente para revisar el contenido del examen y validar la información cargada.';
      }

      if (examState.value === 'active') {
        return 'Entra de nuevo para retomar el examen con tu progreso guardado y continuar donde quedaste.';
      }

      return `Al iniciar se abrirá la interfaz del examen con el checklist correspondiente y una duración de ${durationLabel.value}.`;
    });
    const actionButtonIcon = computed(() => {
      if (attemptStatus.value === 'En progreso' || examState.value === 'active') return 'play-circle';
      if (attemptStatus.value !== 'No iniciado' || examState.value === 'completed') return 'eye';

      return 'arrow-right';
    });
    const actionButtonLabel = computed(() => {
      if (attemptStatus.value === 'En progreso' || examState.value === 'active') return 'Continuar examen';
      if (attemptStatus.value !== 'No iniciado' || examState.value === 'completed') return 'Ver examen';

      return 'Iniciar examen';
    });

    const stateBoxTitle = computed(() => {
      if (attemptStatus.value === 'En progreso') return 'Puedes retomar tu avance';
      if (attemptStatus.value !== 'No iniciado') return `Estado del intento: ${attemptStatus.value}`;

      return 'Guardado automático activo';
    });
    const stateBoxDescription = computed(() => {
      if (attemptStatus.value === 'En progreso') {
        return 'Tu progreso sigue disponible. Al continuar volverás a la pregunta donde quedaste.';
      }

      if (attemptStatus.value === 'No iniciado') {
        return `Las respuestas se conservarán mientras avanzas. El temporizador se calculará con una duración de ${durationLabel.value}.`;
      }

      return 'El intento ya tiene un estado final o administrativo. Puedes entrar en modo revisión para consultar el contenido.';
    });

    const refreshRemainingTime = () => {
      timeRemaining.value = checklistAttempt.value?.fechaInicio ? calculateRegistrationExamRemainingSeconds(checklistAttempt.value.fechaInicio, examDurationSeconds.value) : examDurationSeconds.value;
    };
    const stopCountdownTimer = () => {
      if (!countdownTimerId.value) return;

      window.clearInterval(countdownTimerId.value);
      countdownTimerId.value = null;
    };
    const startCountdownTimerIfNeeded = () => {
      stopCountdownTimer();
      refreshRemainingTime();

      if (!shouldShowRemainingTime.value || timeRemaining.value <= 0) return;

      countdownTimerId.value = window.setInterval(() => {
        refreshRemainingTime();

        if (timeRemaining.value <= 0) {
          stopCountdownTimer();
        }
      }, 1000);
    };

    const ensureChecklistAttempt = async (currentStep: StepDto, context: ExamStepContext) => {
      const rowId = parseNullableId(context.rowId);

      if (rowId) {
        const response = await getChecklistDiligenciadoService.run(rowId);
        checklistAttempt.value = {
          ...response,
          id: parseNullableId(response?.id) || rowId,
        };

        examContext.value = {
          ...context,
          rowId: checklistAttempt.value.id,
        };
        return;
      }

      const usuarioId = resolveAuthenticatedUserId();

      if (!usuarioId) {
        throw new Error('No se pudo identificar el usuario autenticado para crear el intento del examen.');
      }

      checklistAttempt.value = await createChecklistDiligenciadoService.run({
        checklistId: context.checklistId,
        usuarioId,
        institutionId: institutionId.value,
        convocationEnrolId: convocationEnrolId.value,
        convocationStepId: currentStep.id,
        activo: 1,
      });

      examContext.value = {
        ...context,
        rowId: checklistAttempt.value.id,
      };
      emit('refresh');
    };

    const loadExamStep = async () => {
      loadError.value = '';

      const response = await getConvocationWithStepsService.run(convocationId.value, {
        convocationEnrolId: convocationEnrolId.value,
        isAdmin: localStorage.getItem('administratorAsStudent') ? 1 : 0,
      });

      const currentStep = response.steps.find((item: StepDto) => item.id === stepId.value) ?? null;

      if (!currentStep) {
        throw new Error('No se encontró el paso del examen dentro de la convocatoria.');
      }

      step.value = currentStep;
      tutorialVideoUrl.value = String(currentStep.urlVideoConvocationStep ?? '');
      examContext.value = resolveExamContext(currentStep.detail);

      if (!examContext.value?.checklistId) {
        throw new Error('El examen aún no tiene checklist asociado. Mientras backend lo publica, verifica el detail temporal del paso.');
      }

      const definitionResponse = await getRegistrationExamService.run(examContext.value.checklistId);
      const definition = normalizeRegistrationExamDefinition(definitionResponse);
      examDurationSeconds.value = parseRegistrationExamDurationSeconds(definitionResponse.duracion);
      timeRemaining.value = examDurationSeconds.value;
      await ensureChecklistAttempt(currentStep, examContext.value);
      startCountdownTimerIfNeeded();

      const progress = loadRegistrationExamProgress(convocationEnrolId.value, stepId.value, definition.questions);

      totalQuestions.value = resolveProgressNumber(checklistAttempt.value?.totalPreguntas, definition.questions.length);
      totalSections.value = definition.sections.length;
      requiredQuestions.value = definition.questions.filter((question) => question.required).length;
      answeredCount.value = resolveProgressNumber(checklistAttempt.value?.preguntasRespondidas, progress.questions.filter((question) => question.answered).length);
      examState.value = checklistAttempt.value ? mapRegistrationExamBackendStatusToState(checklistAttempt.value.estado) : progress.examState;
    };

    const startExamAttemptIfNeeded = async () => {
      const attemptId = parseNullableId(checklistAttempt.value?.id ?? examContext.value?.rowId);

      if (!attemptId || attemptStatus.value !== 'No iniciado') return;

      checklistAttempt.value = await startChecklistDiligenciadoService.run(attemptId);
      examState.value = mapRegistrationExamBackendStatusToState(checklistAttempt.value.estado);
      startCountdownTimerIfNeeded();
    };

    const goToExamPage = async () => {
      try {
        startingExam.value = true;
        await startExamAttemptIfNeeded();
      } catch (error: any) {
        console.error(error);
        loadError.value = error?.message ?? 'No fue posible iniciar el intento del examen.';
        return;
      } finally {
        startingExam.value = false;
      }

      const queryWithoutMode = Object.fromEntries(Object.entries(route.query).filter(([key]) => key !== 'mode' && key !== 'checklistDiligenciadoId'));
      const checklistDiligenciadoId = parseNullableId(checklistAttempt.value?.id ?? examContext.value?.rowId);

      await router.push({
        name: MODERN_REGISTRATION_EXAM_ROUTE_NAME,
        params: {
          institutionId: institutionId.value,
          convocationId: convocationId.value,
          convocationEnrollId: convocationEnrolId.value,
          stepId: stepId.value,
        },
        query: {
          ...queryWithoutMode,
          ...buildModernRegistrationQuery(),
          ...(checklistDiligenciadoId ? { checklistDiligenciadoId: String(checklistDiligenciadoId) } : {}),
          ...(examState.value === 'completed' ? { mode: 'summary' } : {}),
        },
      });
    };

    onMounted(async () => {
      try {
        await loadExamStep();
      } catch (error: any) {
        console.error(error);
        loadError.value = error?.message ?? 'Ocurrió un error preparando el examen.';
      } finally {
        loading.value = false;
      }
    });

    onBeforeUnmount(() => {
      stopCountdownTimer();
    });

    return {
      answeredCount,
      actionButtonIcon,
      actionButtonLabel,
      actionDescription,
      actionTitle,
      checklistAttempt,
      examContext,
      examDetailItems,
      examEyebrow,
      examState,
      examStateLabel,
      examSubtitle,
      examTitle,
      goToExamPage,
      isFinalAttempt,
      resolvedHelpDescription,
      instructionItems,
      loadError,
      loading,
      progressPercentage,
      requiredQuestions,
      resultCards,
      resultSummaryDescription,
      resolvedTutorialVideoUrl,
      summaryCards,
      startingExam,
      stateBoxDescription,
      stateBoxTitle,
      totalQuestions,
      totalSections,
    };
  },
});
</script>

<style scoped>
.modern-exam-step__shell :deep(.content) {
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: none;
}

.modern-exam-step__shell :deep(.o-card-body) {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.modern-exam-step__hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  border-radius: 24px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border: 1px solid #dbeafe;
}

.modern-exam-step__hero--completed {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border-color: #bbf7d0;
}

.modern-exam-step__heroIcon {
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 22px;
  background: #dbeafe;
  color: #1d4ed8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.55rem;
}

.modern-exam-step__heroIcon--completed {
  background: #dcfce7;
  color: #15803d;
}

.modern-exam-step__heroCopy {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.modern-exam-step__heroCopy h2 {
  margin: 0;
  color: #0f172a;
  font-weight: 700;
  font-size: 1.05rem;
}

.modern-exam-step__sectionHeader h3,
.modern-exam-step__ctaCopy h3 {
  margin: 0;
  color: #0f172a;
  font-weight: 700;
  font-size: 0.97rem;
}

.modern-exam-step__heroCopy p,
.modern-exam-step__instructionItem p,
.modern-exam-step__stateBox p,
.modern-exam-step__sectionDescription,
.modern-exam-step__ctaCopy p {
  margin: 0;
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.65;
}

.modern-exam-step__eyebrow,
.modern-exam-step__sectionEyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 700;
}

.modern-exam-step__eyebrow {
  background: #dbeafe;
  color: #1d4ed8;
}

.modern-exam-step__sectionEyebrow {
  background: #eef2ff;
  color: #4338ca;
}

.modern-exam-step__sectionEyebrow--success {
  background: #dcfce7;
  color: #15803d;
}

.modern-exam-step__heroStatus,
.modern-exam-step__detailCard,
.modern-exam-step__cta {
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 1rem;
}

.modern-exam-step__heroStatus {
  min-width: 11rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modern-exam-step__heroStatus strong,
.modern-exam-step__detailCard strong {
  color: #0f172a;
  font-size: 0.92rem;
}

.modern-exam-step__heroStatus span,
.modern-exam-step__detailCard span {
  color: #64748b;
  font-size: 0.82rem;
}

.modern-exam-step__heroStatus small,
.modern-exam-step__detailCard small {
  color: #94a3b8;
  font-size: 0.78rem;
  line-height: 1.5;
}

.modern-exam-step__heroProgress {
  width: 100%;
  height: 0.45rem;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.modern-exam-step__heroProgressBar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
  transition: width 0.2s ease;
}

.modern-exam-step__detailPanel,
.modern-exam-step__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.modern-exam-step__detailCard {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.9rem;
  align-items: flex-start;
}

.modern-exam-step__detailIcon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.modern-exam-step__detailIcon--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.modern-exam-step__detailIcon--green {
  background: #dcfce7;
  color: #15803d;
}

.modern-exam-step__detailIcon--yellow {
  background: #fef3c7;
  color: #b45309;
}

.modern-exam-step__detailCopy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.modern-exam-step__detailCopy strong {
  line-height: 1.45;
}

.modern-exam-step__stats :deep(.appStatCard) {
  height: 100%;
}

.modern-exam-step__resultPanel {
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid #bbf7d0;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.modern-exam-step__resultGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.modern-exam-step__resultGrid :deep(.appStatCard) {
  height: 100%;
}

.modern-exam-step__sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modern-exam-step__sectionDescription {
  margin-top: 0.45rem;
}

.modern-exam-step__instructionItem {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.9rem;
  align-items: flex-start;
  padding: 0.95rem 1rem;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.modern-exam-step__instructionIndex {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 700;
}

.modern-exam-step__instructionCopy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modern-exam-step__instructionCopy strong {
  color: #0f172a;
  font-size: 0.9rem;
}

.modern-exam-step__stateBox {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem 1.1rem;
  border-radius: 18px;
}

.modern-exam-step__stateBox strong {
  color: #0f172a;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.25rem;
}

.modern-exam-step__stateBox--info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.modern-exam-step__stateBox--danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.modern-exam-step__cta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.modern-exam-step__ctaCopy {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.modern-exam-step__startButton {
  align-self: flex-start;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .modern-exam-step__hero {
    grid-template-columns: 1fr;
  }

  .modern-exam-step__cta {
    grid-template-columns: 1fr;
  }

  .modern-exam-step__heroStatus {
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .modern-exam-step__shell :deep(.o-card-body) {
    padding: 1rem;
  }

  .modern-exam-step__hero,
  .modern-exam-step__instructionItem,
  .modern-exam-step__stateBox {
    padding: 0.9rem;
  }
}
</style>
