<template>
  <AppLoading v-if="loading" />

  <div v-else class="modern-form-step">
    <AppCard>
      <template #body>
        <RegistrationModernHelpAccordion :description="resolvedHelpDescription" :video-url="resolvedTutorialVideoUrl" :default-open="false" />

        <section class="modern-form-step__progressHeader">
          <div>
            <h2 class="modern-form-step__title">Completa tu información</h2>
            <p class="modern-form-step__subtitle">Diligencia tus datos personales, académicos y adicionales antes de continuar.</p>
          </div>

          <span class="modern-form-step__progressValue">{{ totalProgress }}% completado</span>
        </section>

        <div class="modern-form-step__totalProgress">
          <div class="modern-form-step__totalProgressBar" :style="{ width: `${totalProgress}%` }"></div>
        </div>

        <div class="modern-form-step__sections">
          <button
            v-for="(detail, index) in orderedDetails"
            :key="detail.id"
            type="button"
            :class="[
              'modern-form-step__sectionCard',
              {
                'modern-form-step__sectionCard--active': stepIndex === index + 1,
                'modern-form-step__sectionCard--completed': getSectionProgress(detail) === 100,
                'modern-form-step__sectionCard--progress': getSectionProgress(detail) > 0 && getSectionProgress(detail) < 100,
              },
            ]"
            @click="goToSection(index + 1)"
          >
            <div class="modern-form-step__sectionTop">
              <div class="modern-form-step__sectionIcon">
                <AppIcon :icon="getSectionProgress(detail) === 100 ? 'check-circle' : getSectionIcon(detail, index)" />
              </div>

              <div class="modern-form-step__sectionCopy">
                <strong>{{ formatSectionTitle(detail.title) }}</strong>
                <p>{{ getSectionProgress(detail) }}% completado</p>
              </div>
            </div>

            <div class="modern-form-step__sectionProgress">
              <div class="modern-form-step__sectionProgressBar" :style="{ width: `${getSectionProgress(detail)}%` }"></div>
            </div>
          </button>
        </div>

        <div class="modern-form-step__contentPanel">
          <AppLoading v-if="loadingQuestions" />

          <template v-else-if="currentDetail">
            <RegistrationModernMatrixForm
              v-if="currentDetail.isMatriz"
              :key="'matrix-' + currentDetail.id"
              :approved-step="approvedOrInReviewStep"
              :step-index="stepIndex"
              :section-id="currentDetail.id"
              :object-form="objectForm.value['sectionId_' + currentDetail.id]"
              :response-object="customFormAnswers['sectionId_' + currentDetail.id]"
              @update-step="updateStep"
              @update-form="updateForm"
            ></RegistrationModernMatrixForm>

            <RegistrationModernCustomFormInput
              v-else
              :key="'form-' + currentDetail.id"
              :approved-step="approvedOrInReviewStep"
              :step-index="stepIndex"
              :survey-id="currentDetail.surveyId"
              :section-title="currentDetail.title"
              :questions="currentDetail.questions"
              :get-procedure="currentDetail.getProcedure"
              :save-procedure="currentDetail.saveProcedure"
              :section-id="currentDetail.id"
              :object-form="objectForm.value['sectionId_' + currentDetail.id]"
              :response-object="customFormAnswers['sectionId_' + currentDetail.id]"
              :convocation-step-id="resolvedStepId"
              :is-last-section="stepIndex === orderedDetails.length"
              @update-step="updateStep"
            ></RegistrationModernCustomFormInput>
          </template>
        </div>
      </template>
    </AppCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import RegistrationModernCustomFormInput from './RegistrationModernCustomFormInput.vue';
import RegistrationModernHelpAccordion from './RegistrationModernHelpAccordion.vue';
import RegistrationModernMatrixForm from './RegistrationModernMatrixForm.vue';
import { AnswerOptionDto, DetailDto, QuestionDto, StepTypeFormularioDto } from '../dtos/stepTypeFormulario.dto';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { GetQuestionsOfEnrolService } from '../services/getQuestionsOfEnrol.service';

const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const getConvocationWithStepsService = new GetConvocationWithStepsService();
const getQuestionsOfEnrolService = new GetQuestionsOfEnrolService();

const SECTION_ICONS = ['user-circle', 'graduation-cap', 'file-alt'];

export default defineComponent({
  name: 'RegistrationModernFormStep',
  props: {
    embedded: {
      type: Boolean,
      default: true,
    },
    videoUrl: {
      type: String,
      default: '',
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
  },
  components: {
    AppCard,
    AppIcon,
    AppLoading,
    RegistrationModernCustomFormInput,
    RegistrationModernHelpAccordion,
    RegistrationModernMatrixForm,
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const route = useRoute();

    const step: Ref<StepTypeFormularioDto | null> = ref(null);
    const stepIndex = ref(1);
    const approvedOrInReviewStep = ref(false);
    const loadingQuestions = ref(false);
    const loading = ref(true);
    const tutorialDescription = ref('');
    const tutorialVideoUrl = ref('');

    const convocationEnrolId = ref(0);
    const convocationId = ref(0);
    const resolvedStepId = ref(0);

    const resolveId = (propValue: number, ...routeSources: (string | string[] | undefined)[]) => {
      if (propValue) return propValue;
      for (const src of routeSources) {
        const parsed = parseInt(String(src ?? ''), 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return 0;
    };

    const customFormAnswers: any = reactive({});

    const objectForm: { value: any } = reactive({
      value: {},
    });

    const orderedDetails = computed(() => {
      if (!step.value?.detail?.length) return [];

      return [...step.value.detail].sort((a, b) => a.order - b.order);
    });

    const currentDetail = computed(() => orderedDetails.value[stepIndex.value - 1] ?? null);
    const totalProgress = computed(() => {
      if (!orderedDetails.value.length) return 0;

      const total = orderedDetails.value.reduce((acc, detail) => acc + getSectionProgress(detail), 0);

      return Math.round(total / orderedDetails.value.length);
    });
    const defaultHelpDescription =
      'Completa el formulario con tus datos personales, académicos y adicionales.<br /><br />' +
      '• Todos los campos marcados con * son obligatorios<br />' +
      '• La información debe ser verídica y actualizada<br />' +
      '• Puedes navegar entre secciones usando las tarjetas superiores<br />' +
      '• Los datos se validarán en tiempo real<br />' +
      '• Asegúrate de revisar todos los campos antes de continuar';
    const resolvedHelpDescription = computed(() => String(tutorialDescription.value || defaultHelpDescription).replace(/\n/g, '<br />'));
    const resolvedTutorialVideoUrl = computed(() => props.videoUrl || tutorialVideoUrl.value);

    const formatSectionTitle = (value: string) =>
      value
        .toLocaleLowerCase('es')
        .replace(/(^|\s)\S/g, (match) => match.toLocaleUpperCase('es'))
        .trim();

    const getSectionIcon = (detail: DetailDto, index: number) => {
      const normalizedTitle = detail.title.toLocaleLowerCase('es');

      if (normalizedTitle.includes('personal')) return 'user-circle';
      if (normalizedTitle.includes('acad')) return 'graduation-cap';
      if (normalizedTitle.includes('adicional')) return 'file-alt';

      return SECTION_ICONS[index] ?? 'file-alt';
    };

    const hasSelectedAnswerOption = (answerOptions: AnswerOptionDto[]) => answerOptions.some((answer) => answer.selected || answer.detail);

    const isQuestionAnswered = (question: QuestionDto) => {
      if (question.answerOptions.length) {
        return hasSelectedAnswerOption(question.answerOptions);
      }

      if (question.typeData === 'falso_verdadero') {
        return question.rowId === 0 || question.rowId === 1 || question.answer === 'Si' || question.answer === 'No';
      }

      if (question.rowId !== null && question.rowId !== undefined && question.rowId !== '') {
        return true;
      }

      if (Array.isArray(question.answer)) {
        return question.answer.length > 0;
      }

      return question.answer !== null && question.answer !== undefined && String(question.answer).trim() !== '';
    };

    const getSectionProgress = (detail: DetailDto) => {
      if (detail.isMatriz) {
        return detail.responses?.length ? 100 : 0;
      }

      const questions = detail.questions ?? [];

      if (!questions.length) return 0;

      const answeredQuestions = questions.filter((question) => isQuestionAnswered(question)).length;

      return Math.round((answeredQuestions / questions.length) * 100);
    };

    const goToSection = (index: number) => {
      stepIndex.value = index;
    };

    const loadResponseObjectForm = async (detailIds: number[]) => {
      let counter = 0;

      while (counter < detailIds.length) {
        const params = {
          convocationEnrolId: convocationEnrolId.value,
          convocationStepId: resolvedStepId.value,
        };
        const questionsAndresponses: any = await getQuestionsOfEnrolService.run(detailIds[counter], params);

        step.value?.detail.forEach((detailStep) => {
          if (detailStep.id === detailIds[counter]) {
            detailStep.questions = questionsAndresponses.questions;
            detailStep.responses = questionsAndresponses.responses;
          }
        });

        const sectionKey = 'sectionId_' + detailIds[counter];
        customFormAnswers[sectionKey] = [];

        if (questionsAndresponses.questions) {
          customFormAnswers[sectionKey] = questionsAndresponses.questions.map((question: QuestionDto) => ({
            id: question.id,
            questionTypeId: question.questionTypeId,
            answerOptions: question.answerOptions,
            fieldName: question.fieldName,
            answer: question.answer,
          }));
        }

        counter += 1;
      }
    };

    const loadForm = async () => {
      let sectionForm: any = {};
      let sectionData: any = {};
      let selected: any[] = [];
      let sectionKey = '';
      let formKey = '';

      if (step.value) {
        const detailIds = orderedDetails.value.map((detail) => detail.id);
        let counter = 0;

        while (counter < detailIds.length) {
          const params = {
            convocationEnrolId: convocationEnrolId.value,
            convocationStepId: resolvedStepId.value,
          };
          const questionsAndresponses: any = await getQuestionsOfEnrolService.run(detailIds[counter], params);

          sectionKey = 'sectionId_' + detailIds[counter];

          if (questionsAndresponses.questions) {
            questionsAndresponses.questions.forEach((question: QuestionDto) => {
              formKey = 'question_' + question.id;

              if (question.answerOptions.length) {
                question.answerOptions.forEach((answer: AnswerOptionDto) => {
                  if (answer.selected) selected.push(answer.id);
                });

                sectionForm[formKey] = question.questionTypeId == 3 ? selected[0] : selected;
                selected = [];
              } else if (question.typeData == 'falso_verdadero') {
                sectionForm[formKey] = question.rowId == 1 ? true : false;
              } else {
                sectionForm[formKey] = question.rowId ? question.rowId : question.answer ?? null;
              }

              sectionData[formKey] = question.required ? { required } : {};
            });
          }

          objectForm.value[sectionKey] = {
            form: sectionForm,
            v$: sectionData,
          };

          sectionForm = {};
          sectionData = {};
          counter += 1;
        }

        await loadResponseObjectForm(detailIds);
      }
    };

    const refreshParentFlowIfCompleted = () => {
      if (totalProgress.value === 100) {
        emit('refresh');
      }
    };

    const updateForm = async () => {
      loadingQuestions.value = true;
      await loadForm();
      loadingQuestions.value = false;
      refreshParentFlowIfCompleted();
    };

    const updateStep = async (value: boolean) => {
      await updateForm();

      if (value) {
        if (stepIndex.value < orderedDetails.value.length) {
          stepIndex.value += 1;
        }

        return;
      }

      if (stepIndex.value > 1) {
        stepIndex.value -= 1;
      }
    };

    onMounted(async () => {
      try {
        convocationEnrolId.value = resolveId(props.convocationEnrolId, route.params.convocationEnrollId as string, route.query.convocationEnrollId as string);
        convocationId.value = resolveId(props.convocationId, route.params.convocationId as string, route.query.convocationId as string);
        resolvedStepId.value = resolveId(props.stepId, route.params.stepId as string, route.query.stepId as string);

        if (!resolvedStepId.value) {
          loading.value = false;
          return;
        }

        const isAdmin = localStorage.getItem('administratorAsStudent') ? 1 : 0;
        const params = {
          convocationEnrolId: convocationEnrolId.value,
          isAdmin,
        };

        step.value = await getConvocationStepWithDetailService.run({
          id: resolvedStepId.value,
          convocationEnrolId: convocationEnrolId.value,
        });

        const response = await getConvocationWithStepsService.run(convocationId.value, params);
        const stepAux = response.steps.find((item: any) => item.id == resolvedStepId.value);

        approvedOrInReviewStep.value = !!(stepAux && stepAux.isApproved == 1 && stepAux.requiresApproval == 1);
        tutorialDescription.value = stepAux?.description ?? '';
        tutorialVideoUrl.value = stepAux?.urlVideoConvocationStep ?? '';

        await loadForm();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      approvedOrInReviewStep,
      currentDetail,
      customFormAnswers,
      formatSectionTitle,
      getSectionIcon,
      getSectionProgress,
      goToSection,
      loading,
      loadingQuestions,
      objectForm,
      orderedDetails,
      resolvedTutorialVideoUrl,
      resolvedStepId,
      stepIndex,
      totalProgress,
      tutorialDescription,
      tutorialVideoUrl,
      updateForm,
      updateStep,
      resolvedHelpDescription,
    };
  },
});
</script>

<style scoped>
.modern-form-step {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.modern-form-step__progressHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modern-form-step__title {
  margin: 0 0 0.35rem;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 700;
}

.modern-form-step__subtitle {
  margin: 0;
  color: #64748b;
}

.modern-form-step__progressValue {
  color: #1d4ed8;
  font-size: 0.95rem;
  font-weight: 700;
}

.modern-form-step__totalProgress {
  width: 100%;
  height: 0.55rem;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.modern-form-step__totalProgressBar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%);
  transition: width 0.25s ease;
}

.modern-form-step__sections {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.modern-form-step__shell :deep(.content) {
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: none;
}

.modern-form-step__shell :deep(.o-card-body) {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.35rem 1.5rem 1.5rem;
}

.modern-form-step__sectionCard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 22px;
  background: #ffffff;
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
}

.modern-form-step__sectionCard:hover {
  transform: translateY(-1px);
  border-color: rgba(29, 78, 216, 0.25);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
}

.modern-form-step__sectionCard--active {
  border-color: #1d4ed8;
  background: #eff6ff;
}

.modern-form-step__sectionCard--completed {
  border-color: #16a34a;
}

.modern-form-step__sectionTop {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modern-form-step__sectionIcon {
  width: 2.8rem;
  height: 2.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f3f4f6;
  color: #475569;
  flex-shrink: 0;
}

.modern-form-step__sectionCard--active .modern-form-step__sectionIcon {
  background: #1d4ed8;
  color: #ffffff;
}

.modern-form-step__sectionCard--completed .modern-form-step__sectionIcon {
  background: #dcfce7;
  color: #16a34a;
}

.modern-form-step__sectionCopy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.modern-form-step__sectionCopy strong {
  color: #111827;
  font-size: 0.98rem;
}

.modern-form-step__sectionCopy p {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
}

.modern-form-step__sectionProgress {
  width: 100%;
  height: 0.42rem;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.modern-form-step__sectionProgressBar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%);
  transition: width 0.25s ease;
}

.modern-form-step__sectionCard--completed .modern-form-step__sectionProgressBar {
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
}

.modern-form-step__contentPanel {
  padding-top: 0.35rem;
}

@media (max-width: 992px) {
  .modern-form-step__sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modern-form-step__progressHeader {
    flex-direction: column;
  }

  .modern-form-step__shell :deep(.o-card-body) {
    padding: 1rem;
  }
}
</style>
