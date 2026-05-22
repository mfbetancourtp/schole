<template>
  <AppLoading v-if="loading" />

  <div v-else-if="embedded" class="step-type-formulario__embedded">
    <AppCard>
      <template #body>
        <o-steps v-model="stepIndex" :animated="true" :rounded="true" :has-navigation="false" :label-position="'bottom'">
          <o-step-item v-for="(detail, index) in step?.detail" :label="detail.title" :step="index + 1" :key="index + 1">
            <h1 class="title has-text-centered">{{ detail.title }}</h1>

            <AppLoading v-if="loadingQuestions" />

            <template v-else>
              <MatrixForm
                v-if="detail.isMatriz"
                :approved-step="approvedOrInReviewStep"
                :step-index="stepIndex"
                :section-id="detail.id"
                :object-form="objectForm.value['sectionId_' + detail.id]"
                :response-object="customFormAnswers['sectionId_' + detail.id]"
                @update-step="updateStep"
                @update-form="updateForm"
              ></MatrixForm>

              <CustomFormInput
                v-if="!detail.isMatriz"
                :approved-step="approvedOrInReviewStep"
                :step-index="stepIndex"
                :survey-id="detail.surveyId"
                :questions="detail.questions"
                :get-procedure="detail.getProcedure"
                :save-procedure="detail.saveProcedure"
                :section-id="detail.id"
                :object-form="objectForm.value['sectionId_' + detail.id]"
                :response-object="customFormAnswers['sectionId_' + detail.id]"
                @update-step="updateStep"
              ></CustomFormInput>
            </template>
          </o-step-item>
        </o-steps>
      </template>
    </AppCard>
  </div>

  <AppBaseList v-else-if="!loading && convocation" :title="title" :routes="routes" :use-banner="true" :url-banner="urlBanner">
    <template v-slot:actions>
      <AppButtonBack :to="backRoute" />

      <!-- 
        cambio anterior por validar
        <SaveAndExitStep :disabled="approvedOrInReviewStep || disableSaveAndExitBtn" :convocation-enrol-id="`${convocationEnrolId}`" :convocation-step-id="`${stepId}`" /> -->

      <!-- cambio actual -->

      <SaveAndExitStep
        style="color: white"
        :disabled="approvedOrInReviewStep"
        :route-back="backRoute"
        :convocation-enrol-id="`${convocationEnrolId}`"
        :convocation-step-id="`${stepId}`"
        @click="handleSaveAndExit"
      />
    </template>

    <template v-slot:content>
      <template v-if="convocation">
        <AppCard class="appcard-container mb-3">
          <template #body>
            <section style="color: #f43f5e; font-size: 20px" v-html="convocation.title"></section>
            <section v-html="convocation.description"></section>
            <section>
              {{ `Fecha de cierre: ${dayjs(convocation.endDate).locale('es').format('D MMMM YYYY')}` }}
            </section>
          </template>
        </AppCard>
      </template>
      <AppCard>
        <template #body>
          <o-steps v-model="stepIndex" :animated="true" :rounded="true" :has-navigation="false" :label-position="'bottom'">
            <o-step-item v-for="(detail, index) in step?.detail" :label="detail.title" :step="index + 1" :key="index + 1">
              <h1 class="title has-text-centered">{{ detail.title }}</h1>

              <AppLoading v-if="loadingQuestions" />

              <template v-else>
                <MatrixForm
                  v-if="detail.isMatriz"
                  :approved-step="approvedOrInReviewStep"
                  :step-index="stepIndex"
                  :section-id="detail.id"
                  :object-form="objectForm.value['sectionId_' + detail.id]"
                  :response-object="customFormAnswers['sectionId_' + detail.id]"
                  @update-step="updateStep"
                  @update-form="updateForm"
                ></MatrixForm>

                <CustomFormInput
                  v-if="!detail.isMatriz"
                  :approved-step="approvedOrInReviewStep"
                  :step-index="stepIndex"
                  :survey-id="detail.surveyId"
                  :questions="detail.questions"
                  :get-procedure="detail.getProcedure"
                  :save-procedure="detail.saveProcedure"
                  :section-id="detail.id"
                  :object-form="objectForm.value['sectionId_' + detail.id]"
                  :response-object="customFormAnswers['sectionId_' + detail.id]"
                  @update-step="updateStep"
                ></CustomFormInput>
              </template>
            </o-step-item>
          </o-steps>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import localeData from 'dayjs/plugin/localeData';
import es from 'dayjs/locale/es';
import dayjs from 'dayjs';
import MatrixForm from '../components/MatrixForm.vue';
import CustomFormInput from '../components/CustomFormInput.vue';
import SaveAndExitStep from '../components/SaveAndExitStep.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { ConvocationDto } from '../dtos/convocation.dto';
import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { StepTypeFormularioDto, QuestionDto, AnswerOptionDto } from '../dtos/stepTypeFormulario.dto';

import { GetConvocationByIdService } from '../services/getConvocationById.service';
import { GetQuestionsOfEnrolService } from '../services/getQuestionsOfEnrol.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';
import { useHeaderStore } from '../../../stores/header.store';
import { buildRegistrationRoute, isModernRegistrationFlow } from '../utils/registrationFlow.utils';

const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const getConvocationWithStepsService = new GetConvocationWithStepsService();
const getQuestionsOfEnrolService = new GetQuestionsOfEnrolService();
const getConvocationByIdService = new GetConvocationByIdService();
const getInstitutionByIdService = new GetInstitutionByIdService();

dayjs.locale(es);
dayjs.extend(localeData);
export default defineComponent({
  name: 'StepTypeFormulario',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    CustomFormInput,
    SaveAndExitStep,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    MatrixForm,
    AppCard,
  },

  setup(props) {
    const title = ref();
    const route = useRoute();

    useMeta({ title: 'Paso: Formulario' });
    const routes: BreadCrumbsType[] = [{ name: '' }];
    const isAdmin = computed(() => (localStorage.getItem('administratorAsStudent') ? 1 : 0));

    const stepId = route.params.stepId ?? route.query.stepId;
    const convocationId = route.params.convocationId;
    const institutionId = route.params.institutionId;
    const convocationEnrolId = route.params.convocationEnrollId;
    const useModernRegistration = computed(() => isModernRegistrationFlow(route.query));
    const backRoute = computed(() =>
      buildRegistrationRoute(
        {
          institutionId: institutionId.toString(),
          convocationId: convocationId.toString(),
          convocationEnrollId: convocationEnrolId.toString(),
        },
        useModernRegistration.value
      )
    );

    const convocation: Ref<ConvocationDto | null> = ref(null);
    const step: Ref<StepTypeFormularioDto | null> = ref(null);

    const urlBanner = ref('');
    const stepIndex = ref(1);

    const approvedOrInReviewStep = ref(false);
    const disableSaveAndExitBtn = ref(false);
    const loadingQuestions = ref(false);
    const formCompleted = ref(true);
    const loading = ref(true);

    const isFirstForm = computed(() => stepIndex.value === 1);

    const predefinedFormAnswers: any = reactive({});
    const customFormAnswers: any = reactive({});

    const objectForm: { value: any } = reactive({
      value: {},
    });

    const handleSaveAndExit = () => {
      alert('Porfavor No olvide diligenciar todas las secciones del formulario.');
    };

    onMounted(async () => {
      try {
        if (!props.embedded) {
          const headerStorage = useHeaderStore();
          headerStorage.module = { name: 'Formularios', url: '' };
          headerStorage.moduleItem = {
            name: 'Configuración y procesos de admisión',
            url: '',
          };
          headerStorage.moduleSubItem = { name: title.value, url: '' };
        }
        let params2 = { convocationEnrolId, isAdmin: isAdmin.value };

        step.value = await getConvocationStepWithDetailService.run({
          id: stepId,
          convocationEnrolId,
        });
        const response = await getConvocationWithStepsService.run(convocationId, params2);
        convocation.value = await getConvocationByIdService.run(convocationId);

        const stepAux = response.steps.filter((item: any) => item.id == stepId)[0];
        approvedOrInReviewStep.value = stepAux.isApproved == 1 && stepAux.requiresApproval == 1 ? true : false;

        urlBanner.value = convocation.value.urlBanner ?? convocation.value.thumbnail;
        title.value = convocation.value.title;

        if (!props.embedded) {
          await loadRoutes();
        }
        await loadForm();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const loadForm = async () => {
      let sectionForm: any = {};
      let sectionData: any = {};
      let selected: any[] = [];
      let sectionKey = '';
      let formKey = '';

      if (step.value) {
        const detailIds = step.value.detail.map((detail) => {
          return detail.id;
        });

        let counter = 0;

        while (counter < detailIds.length) {
          const detailIsMatriz = step.value.detail.filter((item: any) => item.id == detailIds[counter])[0].isMatriz;
          const params = { convocationEnrolId, convocationStepId: stepId };

          const questionsAndresponses: any = await getQuestionsOfEnrolService.run(detailIds[counter], params);

          sectionKey = 'sectionId_' + detailIds[counter];

          if (detailIsMatriz && !disableSaveAndExitBtn.value && !questionsAndresponses.responses.length) {
            disableSaveAndExitBtn.value = true;
          }

          if (questionsAndresponses.questions) {
            questionsAndresponses.questions.forEach((question: QuestionDto) => {
              formKey = 'question_' + question.id;

              if (question.answerOptions.length) {
                question.answerOptions.forEach((answer: AnswerOptionDto) => {
                  if (answer.selected) selected.push(answer.id);
                });

                sectionForm[formKey] = question.questionTypeId == 3 ? selected[0] : selected;

                selected = [];
              } else {
                if (question.typeData == 'falso_verdadero') sectionForm[formKey] = question.rowId == 1 ? true : false;
                else sectionForm[formKey] = question.rowId ? question.rowId : question.answer ?? null;
              }

              sectionData[formKey] = question.required ? { required } : {};

              if (!detailIsMatriz && !disableSaveAndExitBtn.value && !sectionForm[formKey]) {
                disableSaveAndExitBtn.value = true;
              }
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

    const loadResponseObjectForm = async (detailIds: number[]) => {
      let counter = 0;

      while (counter < detailIds.length) {
        const params = { convocationEnrolId, convocationStepId: stepId };
        const questionsAndresponses: any = await getQuestionsOfEnrolService.run(detailIds[counter], params);

        step.value?.detail.forEach((detailStep) => {
          if (detailStep.id === detailIds[counter]) {
            detailStep.questions = questionsAndresponses.questions;
            detailStep.responses = questionsAndresponses.responses;
          }
        });

        let sectionKey = 'sectionId_' + detailIds[counter];

        if (questionsAndresponses.questions) {
          customFormAnswers[sectionKey] = [];
          let questions: any[] = [];

          questionsAndresponses.questions.forEach((question: QuestionDto) => {
            questions.push({
              id: question.id,
              questionTypeId: question.questionTypeId,
              answerOptions: question.answerOptions,
              fieldName: question.fieldName,
              answer: question.answer,
            });
          });

          customFormAnswers[sectionKey] = questions;
          questions = [];
        }

        counter += 1;
      }
    };

    const updateStep = async (value: boolean) => {
      if (value && stepIndex.value == step.value?.detail.length) stepIndex.value = 0;

      await updateForm();

      stepIndex.value = value ? stepIndex.value + 1 : stepIndex.value - 1;
    };
    const updateForm = async () => {
      loadingQuestions.value = true;
      disableSaveAndExitBtn.value = false;

      await loadForm();

      loadingQuestions.value = false;
    };

    const loadRoutes = async () => {
      let response = await getInstitutionByIdService.run(institutionId);

      routes[0].name = title.value;

      routes.unshift(
        {
          name: `Procesos de matriculación colegio ${response.institution.name}`,
          url: { name: 'surveys.userConvocations' },
        },
        {
          name: `Proceso de matriculación "${convocation.value?.title}"`,
          url: backRoute.value,
        }
      );
    };

    return {
      approvedOrInReviewStep,
      disableSaveAndExitBtn,
      convocationEnrolId,
      urlBanner,
      loading,
      routes,
      title,

      predefinedFormAnswers,
      customFormAnswers,
      loadingQuestions,
      convocation,
      objectForm,
      backRoute,
      stepIndex,
      stepId,
      formCompleted,
      isFirstForm,
      step,
      dayjs,
      updateStep,
      updateForm,
      handleSaveAndExit,
    };
  },
});
</script>
<style scoped>
.appcard-container {
  height: unset;
}

.step-type-formulario__embedded {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
