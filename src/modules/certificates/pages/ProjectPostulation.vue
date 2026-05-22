<template>
  <AppBaseList :title="t('Postulación de Proyecto')">
    <template #actions>
      <AppButton :label="t('Volver')" variant="primary" outlined icon="arrow-left" style="color: white" @click="openBackModal" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="project-postulation">
        <!-- Success screen -->
        <template v-if="submitted">
          <PostulationSuccess :trackingNumber="trackingNumber" @go-back="goToList" />
        </template>

        <!-- Stepper form -->
        <template v-else>
          <div class="project-postulation__welcome">
            <h2 class="project-postulation__title">
              {{ t('Postulación de Proyecto') }}
            </h2>
            <p class="project-postulation__subtitle">
              {{ t('Complete los pasos para registrar su proyecto de grado') }}
            </p>
          </div>

          <!-- Card 1: Timeline/Stepper only -->
          <AppCardDashboard>
            <template #body>
              <div class="pp-stepper">
                <div
                  v-for="(step, index) in steps"
                  :key="step.number"
                  class="pp-stepper__item"
                  :class="{
                    'pp-stepper__item--active': currentStep === step.number,
                    'pp-stepper__item--done': currentStep > step.number,
                  }"
                >
                  <div
                    v-if="index > 0"
                    class="pp-stepper__line"
                    :class="{
                      'pp-stepper__line--filled': currentStep > step.number,
                    }"
                  ></div>
                  <button type="button" class="pp-stepper__bubble" @click="goToStep(step.number)">
                    <AppIcon v-if="currentStep > step.number" icon="check" />
                    <span v-else>{{ step.number }}</span>
                  </button>
                  <span class="pp-stepper__label">{{ t(step.label) }}</span>
                </div>
              </div>
            </template>
          </AppCardDashboard>

          <!-- Card 2: Step content -->
          <AppCardDashboard>
            <template #body>
              <div class="pp-body">
                <BasicInfoStep v-if="currentStep === 1" :form="form" @update:form="Object.assign(form, $event)" />
                <ModalityStep v-else-if="currentStep === 2" :form="form" @update:form="Object.assign(form, $event)" />
                <PreliminaryProjectStep v-else-if="currentStep === 3" :form="form" @update:form="Object.assign(form, $event)" />
                <TutorStep v-else-if="currentStep === 4" :form="form" @update:form="Object.assign(form, $event)" />
              </div>
            </template>

            <template #footer>
              <div class="pp-footer">
                <div v-if="stepErrors.length" class="pp-errors">
                  <AppIcon icon="exclamation-triangle" class="pp-errors__icon" />
                  <div>
                    <div v-for="(error, i) in stepErrors" :key="i" class="pp-errors__item">
                      {{ error }}
                    </div>
                  </div>
                </div>

                <div class="pp-nav">
                  <AppButton v-if="currentStep > 1" :label="t('Anterior')" variant="primary" outlined @click="prevStep" />
                  <div v-else></div>
                  <div class="pp-nav__right">
                    <span class="pp-nav__counter">{{ t('Paso') }} {{ currentStep }} {{ t('de') }} 4</span>
                    <AppButton v-if="currentStep < 4" :label="t('Siguiente')" variant="primary" @click="nextStep" />
                    <AppButton v-else :label="t('Enviar Postulación')" variant="primary" icon="paper-plane" :disabled="submitting" @click="submitPostulation" />
                  </div>
                </div>
              </div>
            </template>
          </AppCardDashboard>
        </template>
      </div>

      <!-- Back confirm modal -->
      <AppModal v-model="backModalOpen">
        <AppFormModal v-if="backModalOpen" title="¿Estás seguro de volver?">
          <template #content>
            <div class="d-flex align-items-center gap-2">
              <AppIcon icon="exclamation-circle" size="3x" class="text-warning" />
              <span class="tw-font-light tw-text-lg">Si volvés ahora, todos los datos ingresados se perderán y deberás comenzar de nuevo.</span>
            </div>
          </template>
          <template #actions>
            <AppButton variant="danger" label="Sí, volver" @click="confirmGoBack" />
          </template>
        </AppFormModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';
import AuthenticatedUserStore from '../../../shared/stores/authenticatedUser.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import BasicInfoStep from '../components/BasicInfoStep.vue';
import ModalityStep from '../components/ModalityStep.vue';
import PreliminaryProjectStep from '../components/PreliminaryProjectStep.vue';
import TutorStep from '../components/TutorStep.vue';
import PostulationSuccess from '../components/PostulationSuccess.vue';

import { CreateApplicationProjectService } from '../services/createApplicationProject.service';
import { CreateApplicationProjectMemberService } from '../services/createApplicationProjectMember.service';
import { UploadApplicationProjectDocumentService } from '../services/uploadApplicationProjectDocument.service';
import type { PostulationFormData } from '../dtos/postulation.dto';

export default defineComponent({
  name: 'ProjectPostulation',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppCardDashboard,
    AppIcon,
    AppModal,
    AppFormModal,
    BasicInfoStep,
    ModalityStep,
    PreliminaryProjectStep,
    TutorStep,
    PostulationSuccess,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    useMeta({ title: 'Postulación de Proyecto' });

    const steps = [
      { number: 1, label: 'Información Básica' },
      { number: 2, label: 'Modalidad' },
      { number: 3, label: 'Anteproyecto' },
      { number: 4, label: 'Tutor' },
    ];

    const loading = ref(false);
    const submitting = ref(false);
    const currentStep = ref(1);
    const submitted = ref(false);
    const trackingNumber = ref('');
    const backModalOpen = ref(false);
    const stepErrors = ref<string[]>([]);

    const form = reactive<PostulationFormData>({
      title: '',
      description: '',
      facultyId: null,
      postulationType: 'Individual',
      partnerId: null,
      scheduleSettingsId: null,
      proposalFile: null,
      annexFile: null,
      tutorId: null,
      noTutorDefined: false,
    });

    const validateStep = (step: number): boolean => {
      const errors: string[] = [];

      if (step === 1) {
        if (!form.title.trim()) errors.push(t('El título del proyecto es obligatorio'));
        if (!form.description.trim()) errors.push(t('La descripción del proyecto es obligatoria'));
        if (!form.facultyId) errors.push(t('Debe seleccionar una facultad'));
        if (form.postulationType === 'En Pareja/Equipo' && !form.partnerId) {
          errors.push(t('Debe seleccionar un compañero para postulación en equipo'));
        }
      } else if (step === 2) {
        if (!form.scheduleSettingsId) errors.push(t('Debe seleccionar una modalidad'));
      } else if (step === 3) {
        if (!form.proposalFile) errors.push(t('Debe adjuntar la propuesta de investigación'));
      } else if (step === 4) {
        if (!form.tutorId && !form.noTutorDefined) {
          errors.push(t('Debe seleccionar un tutor o marcar que no tiene tutor definido'));
        }
      }

      stepErrors.value = errors;
      return errors.length === 0;
    };

    const nextStep = () => {
      if (!validateStep(currentStep.value)) return;
      if (currentStep.value < 4) currentStep.value++;
    };

    const prevStep = () => {
      stepErrors.value = [];
      if (currentStep.value > 1) currentStep.value--;
    };

    const goToStep = (stepNumber: number) => {
      if (currentStep.value > stepNumber) currentStep.value = stepNumber;
    };

    const openBackModal = () => {
      backModalOpen.value = true;
    };

    const confirmGoBack = () => {
      backModalOpen.value = false;
      router.push({ name: 'certificates.projectPostulation' });
    };

    const submitPostulation = async () => {
      if (!validateStep(4)) return;
      submitting.value = true;
      try {
        const response = await new CreateApplicationProjectService().run({
          facultyId: form.facultyId!,
          name: form.title,
          description: form.description,
          applicationType: form.postulationType,
          scheduleSettingsId: form.scheduleSettingsId!,
          tutorId: form.noTutorDefined ? null : form.tutorId,
          unsupervised: form.noTutorDefined ? 1 : 0,
        });

        const createdId: number = response?.data?.id ?? response?.id;

        if (form.postulationType === 'En Pareja/Equipo' && form.partnerId) {
          await new CreateApplicationProjectMemberService().run({
            applicationProjectsId: createdId,
            userId: form.partnerId,
          });
        }

        if (form.proposalFile) {
          await new UploadApplicationProjectDocumentService().run(form.proposalFile, createdId, 'Propuesta de Investigación');
        }

        if (form.annexFile) {
          await new UploadApplicationProjectDocumentService().run(form.annexFile, createdId, 'Anexos Tecnicos');
        }

        trackingNumber.value = `APP-${createdId}`;
        submitted.value = true;
      } finally {
        submitting.value = false;
      }
    };

    const goToList = () => {
      router.push({ name: 'certificates.projectPostulation' });
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: 'Postulación de Proyecto', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    return {
      t,
      loading,
      submitting,
      steps,
      currentStep,
      submitted,
      trackingNumber,
      backModalOpen,
      form,
      stepErrors,
      nextStep,
      prevStep,
      goToStep,
      openBackModal,
      confirmGoBack,
      submitPostulation,
      goToList,
    };
  },
});
</script>

<style scoped>
.project-postulation {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
}

.project-postulation__welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-postulation__title {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.project-postulation__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

/* Stepper (now inside its own card, no divider) */
.pp-stepper {
  display: flex;
  align-items: flex-start;
  padding: 4px 0;
  width: 100%;
}

.pp-stepper__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.pp-stepper__line {
  position: absolute;
  top: 19px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: #e4e7ec;
  z-index: 0;
}

.pp-stepper__line--filled {
  background: var(--color-primary);
}

.pp-stepper__bubble {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e4e7ec;
  background: #ffffff;
  color: #919eab;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  cursor: default;
  transition: all 0.2s;
}

.pp-stepper__item--active .pp-stepper__bubble {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-light);
  box-shadow: 0 0 0 4px rgba(145, 158, 171, 0.16);
}

.pp-stepper__item--done .pp-stepper__bubble {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-light);
  cursor: pointer;
}

.pp-stepper__label {
  margin-top: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #919eab;
  text-align: center;
  white-space: nowrap;
}

.pp-stepper__item--active .pp-stepper__label {
  color: var(--color-primary);
  font-weight: 600;
}

.pp-stepper__item--done .pp-stepper__label {
  color: #637381;
}

.pp-body {
  width: 100%;
  min-width: 0;
}

/* Footer */
.pp-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ec;
}

.pp-errors {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-left: 4px solid #f87171;
  border-radius: 8px;
  padding: 12px 14px;
}

.pp-errors__icon {
  color: #ef4444;
  margin-top: 2px;
  flex-shrink: 0;
}

.pp-errors__item {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #b91c1c;
  line-height: 1.6;
}

.pp-errors__item::before {
  content: '• ';
}

.pp-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pp-nav__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pp-nav__counter {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
}

.back-modal__text {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 576px) {
  .pp-stepper__label {
    font-size: 10px;
  }

  .pp-nav {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
