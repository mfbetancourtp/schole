<template>
  <AppLoading v-if="loading" />

  <AppBaseList v-else :title="title" :routes="routes">
    <template #actions>
      <template v-if="!isAdmin">
        <AppButton style="color: white" variant="secondary" outlined @click="goBack">Volver</AppButton>
      </template>

      <template v-else>
        <AppButton style="color: white" variant="secondary" outlined @click="backToAdministrator"> Volver al administrador </AppButton>
      </template>
    </template>

    <template #content>
      <div v-if="convocation" class="registration-modern">
        <section class="registration-modern__hero" :style="heroStyle">
          <div class="registration-modern__heroOverlay"></div>

          <div class="registration-modern__heroContent">
            <span class="registration-modern__eyebrow"> Portal de admisión estudiantil </span>

            <div class="registration-modern__heroHeading">
              <h1 class="registration-modern__heroTitle" v-html="convocation.title"></h1>
              <p class="registration-modern__heroDescription">
                {{ heroDescription }}
              </p>
            </div>

            <div class="registration-modern__heroMeta">
              <span class="registration-modern__heroPill">
                <AppIcon icon="calendar" class="me-2" />
                {{ subtitle }}
              </span>

              <span class="registration-modern__heroPill">
                <AppIcon icon="check-circle" class="me-2" />
                {{ completedStepsCount }} de {{ visualSteps.length }} pasos completados
              </span>

              <span class="registration-modern__heroPill">
                <AppIcon :icon="convocation.requiredOrder === 1 ? 'tasks' : 'layer-group'" class="me-2" />
                {{ convocation.requiredOrder === 1 ? 'Flujo secuencial' : 'Flujo flexible' }}
              </span>

              <span v-if="institutionName" class="registration-modern__heroPill">
                <AppIcon icon="university" class="me-2" />
                {{ institutionName }}
              </span>
            </div>
          </div>
        </section>

        <section class="registration-modern__progressSurface">
          <div class="registration-modern__progressHeader">
            <span class="registration-modern__progressLabel">Paso {{ selectedStepIndexLabel }} de {{ visualSteps.length }}</span>
            <span class="registration-modern__progressPercent">{{ progressPercentage }}%</span>
          </div>

          <div class="registration-modern__progressTrack">
            <div class="registration-modern__progressBar" :style="{ width: `${progressPercentage}%` }"></div>
          </div>

          <p class="registration-modern__progressText">
            {{ progressNarrative }}
          </p>
        </section>

        <section class="registration-modern__wizardSurface">
          <AppWizardStepper :model-value="selectedStep?.raw.id ?? 0" :steps="wizardSteps" :clickable="true" @update:modelValue="handleSelectStep" />
        </section>

        <section v-if="selectedStep" class="registration-modern__stepSurface">
          <div class="registration-modern__stepBody">
            <component
              :is="selectedStepComponent"
              v-if="selectedStepComponent"
              :key="selectedStep.raw.id"
              embedded
              :step-id="selectedStep.raw.id"
              :convocation-id="convocationId"
              :convocation-enrol-id="convocationEnrolId"
              :video-url="selectedStep.raw.urlVideoConvocationStep ?? ''"
              @refresh="refreshFlowState"
            />

            <AppCard v-else>
              <template #body>
                <div class="registration-modern__unsupported">
                  <AppIcon icon="info-circle" />
                  <div>
                    <h3>Este tipo de paso aún no está disponible en la vista moderna</h3>
                    <p>Puedes continuar usando el flujo clásico para este paso mientras terminamos esta integración.</p>
                  </div>
                </div>
              </template>
            </AppCard>
          </div>
        </section>

        <section v-if="selectedStep" class="registration-modern__actionBar">
          <div class="registration-modern__actionGroup">
            <AppButton v-if="previousSelectableStep" variant="secondary" outlined @click="goToPreviousStep">
              <AppIcon icon="arrow-left" class="me-2" />
              Volver
            </AppButton>

            <!-- <SaveAndExitStep :convocation-enrol-id="String(convocationEnrolId)" :convocation-step-id="String(selectedStep.raw.id)" :route-back="modernRoute" /> -->
          </div>

          <AppButton variant="primary" :disabled="primaryActionDisabled" @click="handlePrimaryAction">
            {{ primaryActionLabel }}
            <AppIcon v-if="nextSelectableStep" icon="arrow-right" class="ms-2" />
          </AppButton>
        </section>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch, type Component } from 'vue';
import { useMeta } from 'vue-meta';
import { RouteLocationRaw, useRoute, useRouter } from 'vue-router';

import dayjs from 'dayjs';
import es from 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';

import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppWizardStepper from '../../../shared/components/Stepper/AppWizardStepper.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import RegistrationModernAttachmentStep from '../components/RegistrationModernAttachmentStep.vue';
import RegistrationModernDocumentStep from '../components/RegistrationModernDocumentStep.vue';
import RegistrationModernExamStep from '../components/RegistrationModernExamStep.vue';
import RegistrationModernSubjectEnrollmentStep from '../components/RegistrationModernSubjectEnrollmentStep.vue';
import RegistrationModernFormStep from '../components/RegistrationModernFormStep.vue';
import RegistrationModernPaymentStep from '../components/RegistrationModernPaymentStep.vue';
import SaveAndExitStep from '../components/SaveAndExitStep.vue';
import type { ConvocationStepsDto, StepDto } from '../dtos/convocationWithSteps.dto';
import { StepTypesConstant } from '../constants/stepTypes.constant';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { UpdateEnrollProgressService } from '../services/updateEnrollProgress.service';
import { isRegistrationExamStep, loadRegistrationExamProgress } from '../utils/registrationExam.utils';
import { MODERN_REGISTRATION_ROUTE_NAME, buildModernRegistrationQuery } from '../utils/registrationFlow.utils';

const isSubjectEnrollmentStep = (step: { ConvocationStepType?: { name?: string | null } | null }) => {
  const name = step.ConvocationStepType?.name?.trim().toLowerCase() ?? '';
  return /matriculas?\s+de\s+asignaturas?/.test(name);
};

const isEvaluationExamStep = (step: {
  convocationStepTypeId?: number;
  title?: string | null;
  description?: string | null;
  detail?: Array<{ title?: string | null; description?: string | null }> | Record<string, unknown> | null;
}) => step.convocationStepTypeId === StepTypesConstant.EVALUATION_EXAM || (step.convocationStepTypeId === StepTypesConstant.ATTACHED && isRegistrationExamStep(step));

dayjs.locale(es);
dayjs.extend(localeData);

const getConvocationWithStepsService = new GetConvocationWithStepsService();
const getInstitutionByIdService = new GetInstitutionByIdService();
const institutionsService = new InstitutionsService();
const updateEnrollProgressService = new UpdateEnrollProgressService();

interface StepWithDetails extends StepDto {
  detail?: any[] | Record<string, any> | null;
}

type StepState = 'completed' | 'current' | 'pending' | 'locked';
type StepTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface VisualStep {
  raw: StepWithDetails;
  position: number;
  title: string;
  description: string;
  typeLabel: string;
  icon: string;
  statusLabel: string;
  statusTone: StepTone;
  detailNarrative: string;
  completed: boolean;
  locked: boolean;
  current: boolean;
  state: StepState;
}

const stepTypeMap: Record<
  number,
  {
    typeLabel: string;
    icon: string;
    component?: Component;
    fallbackDescription: string;
  }
> = {
  1: {
    typeLabel: 'Formulario',
    icon: 'file-alt',
    component: RegistrationModernFormStep,
    fallbackDescription: 'Completa la información requerida para avanzar en tu inscripción.',
  },
  2: {
    typeLabel: 'Pago',
    icon: 'dollar-sign',
    component: RegistrationModernPaymentStep,
    fallbackDescription: 'Revisa el valor a pagar, los descuentos y registra tu transacción.',
  },
  3: {
    typeLabel: 'Documento',
    icon: 'file-signature',
    component: RegistrationModernDocumentStep,
    fallbackDescription: 'Consulta, firma y valida los documentos asociados al proceso.',
  },
  4: {
    typeLabel: 'Adjunto',
    icon: 'paperclip',
    component: RegistrationModernAttachmentStep,
    fallbackDescription: 'Carga los soportes y archivos requeridos para continuar.',
  },
};

const stripHtml = (value?: string | null) =>
  value
    ? value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : '';

const hasAllFilesCompleted = (step: StepWithDetails) => {
  if (!Array.isArray(step.detail) || !step.detail.length) return false;

  return step.detail.every((detail: any) => {
    if ('enrolDocument' in detail) {
      return !!(detail.enrolDocument?.urlSignedDocument || detail.enrolDocument);
    }

    if ('enrolAttachment' in detail) {
      return !!detail.enrolAttachment;
    }

    return false;
  });
};

const resolveStepStatus = (step: StepWithDetails): Pick<VisualStep, 'statusLabel' | 'statusTone' | 'completed' | 'detailNarrative'> => {
  if (step.convocationStepTypeId === 1 || step.convocationStepTypeId === 2) {
    if (step.requiresApproval === 1 && step.isApproved === 1) {
      return {
        statusLabel: 'Aprobado',
        statusTone: 'success',
        completed: true,
        detailNarrative: 'Validado correctamente por administración.',
      };
    }

    if (step.requiresApproval === 1 && step.isApproved === 0) {
      return {
        statusLabel: 'Detenido',
        statusTone: 'danger',
        completed: false,
        detailNarrative: 'Requiere ajustes para poder continuar.',
      };
    }

    if (step.requiresApproval === 1 && step.isApproved == null) {
      return {
        statusLabel: 'En revisión',
        statusTone: 'warning',
        completed: false,
        detailNarrative: 'La información fue enviada a validación.',
      };
    }

    if (step.requiresApproval === 0 && (step.isApproved === 1 || step.isApproved === 2)) {
      return {
        statusLabel: 'Finalizado',
        statusTone: 'success',
        completed: true,
        detailNarrative: 'Completado correctamente.',
      };
    }

    if (step.requiresApproval === 0 && step.isApproved === 0) {
      return {
        statusLabel: 'Detenido',
        statusTone: 'danger',
        completed: false,
        detailNarrative: 'Este paso no pudo completarse.',
      };
    }

    return {
      statusLabel: 'Pendiente',
      statusTone: 'neutral',
      completed: false,
      detailNarrative: 'Aún no se ha diligenciado.',
    };
  }

  const detailCompleted = hasAllFilesCompleted(step);

  if (step.requiresApproval === 1 && detailCompleted && step.isApproved === 1) {
    return {
      statusLabel: 'Aprobado',
      statusTone: 'success',
      completed: true,
      detailNarrative: 'Validado correctamente por administración.',
    };
  }

  if (step.requiresApproval === 1 && detailCompleted && step.isApproved === 0) {
    return {
      statusLabel: 'Detenido',
      statusTone: 'danger',
      completed: false,
      detailNarrative: 'Debes corregir y reenviar la información.',
    };
  }

  if (step.requiresApproval === 1 && detailCompleted && step.isApproved == null) {
    return {
      statusLabel: 'En revisión',
      statusTone: 'warning',
      completed: false,
      detailNarrative: 'La evidencia está siendo validada.',
    };
  }

  if (step.requiresApproval === 0 && detailCompleted) {
    return {
      statusLabel: 'Finalizado',
      statusTone: 'success',
      completed: true,
      detailNarrative: 'El paso ya cuenta con toda la información requerida.',
    };
  }

  return {
    statusLabel: 'Pendiente',
    statusTone: 'neutral',
    completed: false,
    detailNarrative: 'Aún falta completar la información o los archivos requeridos.',
  };
};

const resolveExamStepStatus = (step: StepWithDetails, convocationEnrolId: number): Pick<VisualStep, 'statusLabel' | 'statusTone' | 'completed' | 'detailNarrative'> => {
  const baseStatus = resolveStepStatus(step);

  if (baseStatus.completed) return baseStatus;

  const progress = loadRegistrationExamProgress(convocationEnrolId, step.id);

  if (progress.examState === 'completed') {
    return {
      statusLabel: 'Finalizado',
      statusTone: 'success',
      completed: true,
      detailNarrative: 'El examen de admisión fue completado correctamente.',
    };
  }

  if (progress.examState === 'active') {
    return {
      statusLabel: 'En progreso',
      statusTone: 'warning',
      completed: false,
      detailNarrative: 'Tienes un intento del examen en curso.',
    };
  }

  return {
    statusLabel: 'Pendiente',
    statusTone: 'neutral',
    completed: false,
    detailNarrative: 'Aún no has iniciado el examen de admisión.',
  };
};

const isStepUnlockedByPrevious = (steps: StepWithDetails[], index: number) => {
  if (index === 0) return true;

  const previousStep = steps[index - 1];

  return (
    previousStep && (previousStep.requiresApproval === 0 || previousStep.requiresApproval === 1) && (previousStep.isApproved === 1 || previousStep.isApproved === '' || previousStep.isApproved === 2)
  );
};

export default defineComponent({
  name: 'RegistrationStepsConvocationModern',
  components: {
    AppBaseList,
    AppButton,
    AppCard,
    AppIcon,
    AppLoading,
    AppWizardStepper,
    RegistrationModernSubjectEnrollmentStep,
    SaveAndExitStep,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    useMeta({ title: 'Portal de admisión estudiantil' });

    const loading = ref(true);
    const convocation: Ref<ConvocationStepsDto | null> = ref(null);
    const institutionName = ref('');

    const title = ref('Portal de admisión estudiantil');
    const subtitle = ref('');
    const routes = ref<any[]>([{ name: title.value }]);

    const convocationEnrolId = ref(0);
    const convocationId = ref(0);
    const institutionId = ref(0);
    const examProgressVersion = ref(0);

    const isAdmin = computed(() => (localStorage.getItem('administratorAsStudent') ? 1 : 0));

    const modernRoute = computed<RouteLocationRaw>(() => ({
      name: MODERN_REGISTRATION_ROUTE_NAME,
      params: {
        institutionId: institutionId.value,
        convocationId: convocationId.value,
        convocationEnrollId: convocationEnrolId.value,
      },
      query: {
        ...route.query,
        ...buildModernRegistrationQuery(),
        stepId: selectedStep.value ? String(selectedStep.value.raw.id) : undefined,
      },
    }));

    const userConvocationsRoute = computed<RouteLocationRaw>(() => ({
      name: 'surveys.userConvocations',
      params: { institutionId: institutionId.value },
    }));

    const visualSteps = computed<VisualStep[]>(() => {
      if (!convocation.value?.steps?.length) return [];

      examProgressVersion.value;

      let currentAssigned = false;
      const steps = [...(convocation.value.steps as StepWithDetails[])].sort((a, b) => a.order - b.order);

      return steps.map((step, index) => {
        const isExamAttachment = isEvaluationExamStep(step);
        const isSubjectEnrollment = isSubjectEnrollmentStep(step);
        const stepConfig = stepTypeMap[step.convocationStepTypeId] ?? stepTypeMap[1];
        const status = isExamAttachment ? resolveExamStepStatus(step, convocationEnrolId.value) : resolveStepStatus(step);
        const locked = convocation.value?.requiredOrder === 1 ? !isStepUnlockedByPrevious(steps, index) : false;
        const current = !status.completed && !locked && !currentAssigned;

        if (current) currentAssigned = true;

        return {
          raw: step,
          position: index + 1,
          title: step.title,
          description:
            stripHtml(step.description) ||
            (isExamAttachment
              ? 'Realiza el examen de admisión para finalizar tu proceso.'
              : isSubjectEnrollment
              ? 'Selecciona y matricula tus asignaturas para el periodo.'
              : stepConfig.fallbackDescription),
          typeLabel: isExamAttachment ? 'Examen' : isSubjectEnrollment ? 'Matrícula' : stepConfig.typeLabel,
          icon: isExamAttachment ? 'tasks' : isSubjectEnrollment ? 'graduation-cap' : stepConfig.icon,
          statusLabel: status.statusLabel,
          statusTone: status.statusTone,
          detailNarrative: status.detailNarrative,
          completed: status.completed,
          locked,
          current,
          state: status.completed ? 'completed' : current ? 'current' : locked ? 'locked' : 'pending',
        };
      });
    });

    const fallbackStep = computed<VisualStep | null>(() => {
      if (!visualSteps.value.length) return null;

      return visualSteps.value.find((step) => step.current) ?? [...visualSteps.value].reverse().find((step) => step.completed) ?? visualSteps.value[0];
    });

    const selectedStep = computed<VisualStep | null>(() => {
      if (!visualSteps.value.length) return null;

      const requestedStepId = Number(route.query.stepId);
      const requestedStep = visualSteps.value.find((step) => step.raw.id === requestedStepId);

      if (requestedStep && !requestedStep.locked) {
        return requestedStep;
      }

      return fallbackStep.value;
    });

    const selectedStepIndex = computed(() => {
      if (!selectedStep.value) return -1;

      return visualSteps.value.findIndex((step) => step.raw.id === selectedStep.value?.raw.id);
    });

    const previousSelectableStep = computed<VisualStep | null>(() => {
      if (selectedStepIndex.value <= 0) return null;

      for (let index = selectedStepIndex.value - 1; index >= 0; index -= 1) {
        if (!visualSteps.value[index].locked) {
          return visualSteps.value[index];
        }
      }

      return null;
    });

    const immediateNextStep = computed<VisualStep | null>(() => {
      if (selectedStepIndex.value < 0 || selectedStepIndex.value >= visualSteps.value.length - 1) return null;

      return visualSteps.value[selectedStepIndex.value + 1] ?? null;
    });

    const nextSelectableStep = computed<VisualStep | null>(() => {
      if (selectedStepIndex.value < 0) return null;

      for (let index = selectedStepIndex.value + 1; index < visualSteps.value.length; index += 1) {
        if (!visualSteps.value[index].locked) {
          return visualSteps.value[index];
        }
      }

      return null;
    });

    const hasMoreSteps = computed(() => selectedStepIndex.value >= 0 && selectedStepIndex.value < visualSteps.value.length - 1);

    const completedStepsCount = computed(() => visualSteps.value.filter((step) => step.completed).length);

    const progressPercentage = computed(() => {
      if (!visualSteps.value.length) return 0;

      return Math.round((completedStepsCount.value / visualSteps.value.length) * 100);
    });

    const selectedStepIndexLabel = computed(() => selectedStep.value?.position ?? 0);

    const progressNarrative = computed(() => {
      if (!selectedStep.value) return 'Aún no hay pasos disponibles para este proceso.';

      return 'Completa los siguientes pasos para continuar';
    });

    const heroDescription = computed(() => stripHtml(convocation.value?.description) || 'Completa cada paso del proceso con el mismo orden y servicios que ya maneja la plataforma.');

    const heroStyle = computed(() => ({
      backgroundImage: `linear-gradient(135deg, rgba(10, 14, 27, 0.82), rgba(10, 14, 27, 0.45)), url(${convocation.value?.urlBanner ?? convocation.value?.thumbnail ?? ImageNotAvailable})`,
    }));

    const wizardSteps = computed(() =>
      visualSteps.value.map((step) => ({
        id: step.raw.id,
        title: step.title,
        icon: step.completed && step.raw.id !== selectedStep.value?.raw.id ? 'check' : step.icon,
        status: step.raw.id === selectedStep.value?.raw.id ? 'active' : step.completed ? 'done' : step.locked ? 'locked' : 'pending',
      }))
    );

    const selectedStepComponent = computed<Component | null>(() => {
      if (!selectedStep.value) return null;

      if (isEvaluationExamStep(selectedStep.value.raw)) {
        return RegistrationModernExamStep;
      }

      if (isSubjectEnrollmentStep(selectedStep.value.raw)) {
        return RegistrationModernSubjectEnrollmentStep;
      }

      return stepTypeMap[selectedStep.value.raw.convocationStepTypeId]?.component ?? null;
    });

    const selectedStepRequiresExamCompletion = computed(() => {
      if (!selectedStep.value) return false;

      examProgressVersion.value;

      if (!isEvaluationExamStep(selectedStep.value.raw)) {
        return false;
      }

      return loadRegistrationExamProgress(convocationEnrolId.value, selectedStep.value.raw.id).examState !== 'completed';
    });

    const loadFlowState = async () => {
      const response = await getConvocationWithStepsService.run(convocationId.value, {
        convocationEnrolId: convocationEnrolId.value,
        isAdmin: isAdmin.value,
      });

      convocation.value = response;
      subtitle.value = `Fecha de cierre: ${dayjs(response.endDate).locale('es').format('D [de] MMMM [de] YYYY')}`;

      return response;
    };

    const primaryActionLabel = computed(() => {
      if (selectedStepRequiresExamCompletion.value) return 'Completa el examen';
      if (nextSelectableStep.value) return 'Continuar';
      if (hasMoreSteps.value && immediateNextStep.value?.locked) return 'Siguiente bloqueado';

      return 'Finalizar';
    });

    const primaryActionDisabled = computed(() => !selectedStep.value || selectedStepRequiresExamCompletion.value || (hasMoreSteps.value && !nextSelectableStep.value));

    const syncRouteWithSelectedStep = async () => {
      if (!selectedStep.value) return;
      if (route.name !== MODERN_REGISTRATION_ROUTE_NAME) return;

      const desiredStepId = String(selectedStep.value.raw.id);
      const currentStepId = String(route.query.stepId ?? '');

      if (currentStepId === desiredStepId) return;

      await router.replace({
        name: MODERN_REGISTRATION_ROUTE_NAME,
        params: {
          institutionId: institutionId.value,
          convocationId: convocationId.value,
          convocationEnrollId: convocationEnrolId.value,
        },
        query: {
          ...route.query,
          ...buildModernRegistrationQuery(),
          stepId: desiredStepId,
        },
      });
    };

    const handleSelectStep = async (stepId: string | number) => {
      const targetStep = visualSteps.value.find((step) => String(step.raw.id) === String(stepId));

      if (!targetStep || targetStep.locked) return;

      await router.replace({
        name: MODERN_REGISTRATION_ROUTE_NAME,
        params: {
          institutionId: institutionId.value,
          convocationId: convocationId.value,
          convocationEnrollId: convocationEnrolId.value,
        },
        query: {
          ...route.query,
          ...buildModernRegistrationQuery(),
          stepId: String(targetStep.raw.id),
        },
      });
    };

    const goToPreviousStep = async () => {
      if (!previousSelectableStep.value) return;

      await handleSelectStep(previousSelectableStep.value.raw.id);
    };

    const handlePrimaryAction = async () => {
      if (selectedStep.value) {
        try {
          await updateEnrollProgressService.run(convocationEnrolId.value, selectedStep.value.raw.id);
        } catch (error) {
          console.log('Error actualizando progreso', error);
        }
      }

      if (nextSelectableStep.value) {
        await handleSelectStep(nextSelectableStep.value.raw.id);
        return;
      }

      if (hasMoreSteps.value) return;

      await router.push(userConvocationsRoute.value);
    };

    const goBack = () => {
      router.push({
        name: 'surveys.convocationInscripcion',
        params: {
          institutionId: institutionId.value,
          convocationId: convocationId.value,
        },
      });
    };

    const backToAdministrator = async () => {
      await router.push({
        name: 'surveys.adminConvocationSummaryInscritos',
        params: { convocationId: convocationId.value },
      });
      localStorage.removeItem('administratorAsStudent');
    };

    const refreshFlowState = async () => {
      try {
        await loadFlowState();
        examProgressVersion.value += 1;
      } catch (error) {
        console.log(error);
      }
    };

    watch(selectedStep, async () => {
      await syncRouteWithSelectedStep();
    });

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();

        convocationEnrolId.value = parseInt(route.params.convocationEnrollId.toString(), 10);
        convocationId.value = parseInt(route.params.convocationId.toString(), 10);
        institutionId.value = parseInt(route.params.institutionId.toString(), 10);

        if (institutionId.value) {
          const institution = institutionsService.getInstitutions().find((inst) => inst.id === institutionId.value);
          if (institution) institutionsService.setSelectedInstitutions(institution);
          else localStorage.setItem('institutionId', institutionId.value.toString());
        }

        const [convocationResponse, institutionResponse] = await Promise.all([loadFlowState(), getInstitutionByIdService.run(institutionId.value)]);

        institutionName.value = institutionResponse?.institution?.name ?? '';

        routes.value = [
          {
            name: `Proceso de matriculación "${convocationResponse.title}"`,
          },
        ];

        if (!isAdmin.value) {
          routes.value.unshift({
            name: `Proceso de matriculación colegio ${institutionName.value}`,
            url: {
              name: 'surveys.userConvocations',
              params: { institutionId: institutionId.value },
            },
          });
        }

        headerStorage.module = { name: 'Formularios', url: '' };
        headerStorage.moduleItem = {
          name: 'Configuración y procesos de admisión',
          url: '',
        };
        headerStorage.moduleSubItem = {
          name: title.value,
          url: '',
        };
      } catch (error) {
        console.log(error);
      }

      loading.value = false;
    });

    return {
      backToAdministrator,
      goBack,
      completedStepsCount,
      convocation,
      goToPreviousStep,
      handlePrimaryAction,
      handleSelectStep,
      heroDescription,
      heroStyle,
      immediateNextStep,
      institutionName,
      isAdmin,
      loading,
      modernRoute,
      nextSelectableStep,
      previousSelectableStep,
      primaryActionDisabled,
      primaryActionLabel,
      progressNarrative,
      progressPercentage,
      refreshFlowState,
      routes,
      selectedStep,
      selectedStepComponent,
      selectedStepIndexLabel,
      subtitle,
      title,
      userConvocationsRoute,
      visualSteps,
      wizardSteps,
      convocationEnrolId,
      convocationId,
    };
  },
});
</script>

<style scoped>
.registration-modern {
  --registration-surface: #ffffff;
  --registration-surface-soft: #f7f8fb;
  --registration-border: #e5e7eb;
  --registration-text: #111827;
  --registration-muted: #6b7280;
  --registration-strong: #0f172a;
  --registration-success: #15803d;
  --registration-success-soft: #dcfce7;
  --registration-warning: #b45309;
  --registration-warning-soft: #fef3c7;
  --registration-danger: #b91c1c;
  --registration-danger-soft: #fee2e2;
  --registration-info: #1d4ed8;
  --registration-info-soft: #dbeafe;

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.registration-modern__hero {
  position: relative;
  min-height: 24rem;
  border-radius: 32px;
  overflow: hidden;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.2);
}

.registration-modern__heroOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.72) 100%);
}

.registration-modern__heroContent {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1.25rem;
  min-height: 24rem;
  padding: 2rem;
  color: #ffffff;
}

.registration-modern__heroHeading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.registration-modern__eyebrow,
.registration-modern__sectionEyebrow {
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

.registration-modern__eyebrow {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.registration-modern__sectionEyebrow {
  background: #eef2ff;
  color: var(--registration-info);
}

.registration-modern__heroTitle {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.05;
  font-weight: 700;
}

.registration-modern__heroDescription {
  margin: 0;
  max-width: 52rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.92);
}

.registration-modern__heroMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.registration-modern__heroPill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  font-size: 0.92rem;
}

.registration-modern__heroPill {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
}

.registration-modern__progressHeader,
.registration-modern__actionBar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.registration-modern__progressText,
.registration-modern__unsupported p {
  margin: 0;
  color: var(--registration-muted);
}

.registration-modern__progressSurface {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.registration-modern__progressLabel,
.registration-modern__progressPercent {
  font-size: 0.95rem;
  font-weight: 600;
}

.registration-modern__progressLabel {
  color: var(--registration-text);
}

.registration-modern__progressPercent {
  color: var(--registration-info);
}

.registration-modern__progressTrack {
  height: 0.5rem;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.registration-modern__progressBar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%);
  transition: width 0.35s ease;
}

.registration-modern__progressText {
  font-size: 0.92rem;
}

.registration-modern__actionBar {
  align-items: center;
}

.registration-modern__actionGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.registration-modern__unsupported {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem 0;
}

.registration-modern__unsupported h3 {
  margin: 0 0 0.35rem;
  color: var(--registration-text);
}

@media (max-width: 992px) {
  .registration-modern__progressHeader,
  .registration-modern__actionBar {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .registration-modern__hero,
  .registration-modern__heroContent {
    min-height: 20rem;
  }

  .registration-modern__heroContent,
  .registration-modern__progressSurface,
  .registration-modern__wizardSurface,
  .registration-modern__stepSurface,
  .registration-modern__actionBar {
    padding: 1.15rem;
  }

  .registration-modern__heroTitle {
    font-size: 2rem;
  }

  .registration-modern__actionGroup {
    width: 100%;
  }

  .registration-modern__actionGroup :deep(.o-btn) {
    width: 100%;
  }
}
</style>
