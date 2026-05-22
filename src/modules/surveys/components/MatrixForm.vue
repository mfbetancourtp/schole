<template>
  <AppLoading v-if="loading"></AppLoading>

  <div v-else>
    <AppLoading v-if="loadingDetail"></AppLoading>

    <section v-else class="mb-2">
      <div class="d-flex align-items-stretch gap-2">
        <AppButtonNewContainer class="p-1 ps-5 pe-5" @click="clearForm()"></AppButtonNewContainer>

        <div v-for="(parent, index) in parents" :key="index">
          <AppButton :outlined="numberResponse != parent.numberResponse" @click="loadAnswers(parent.numberResponse)" :label="parent.key"></AppButton>
        </div>
      </div>

      <div class="border p-2 mt-3">
        <SearchForParent v-if="showSearchForParent && saveProcedure == 'saveParents'" :convocation-step-id="stepId" :survey-section-id="sectionId" @data-people="loadDataPeople"></SearchForParent>

        <AppLoading v-if="loadingForm"></AppLoading>

        <CustomFormInput
          v-else-if="(!loadingForm && !showSearchForParent) || saveProcedure != 'saveParents'"
          :step-index="stepIndex"
          :survey-id="surveyId"
          :approved-step="approvedStep"
          :questions="questions"
          :get-procedure="getProcedure"
          :save-procedure="saveProcedure"
          :section-id="sectionId"
          :object-form="objectFormReactive"
          :response-object="responseObject"
          :is-matriz="true"
          :people-id="peopleId"
          :number-response="numberResponse"
          :key-predefined-form="keyPredefinedForm"
          :convocation-enrol-step-id="convocationEnrolStepId"
          @update-step="updateStep"
        ></CustomFormInput>
      </div>
    </section>

    <div class="d-flex justify-content-end gap-1">
      <AppButton :disabled="stepIndex == 1" :label="'Atrás'" outlined @click="manageStep(0)"></AppButton>

      <AppButton :disabled="!parents.length && !skipForm" :label="'Siguiente'" @click="manageStep(1)"></AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';

import SearchForParent from './SearchForParent.vue';
import CustomFormInput from '../components/CustomFormInput.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { GetQuestionsOfEnrolService } from '../services/getQuestionsOfEnrol.service';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';

const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const getQuestionsOfEnrolService = new GetQuestionsOfEnrolService();

export default defineComponent({
  name: 'MatrixForm',
  components: {
    AppLoading,
    AppButton,
    AppButtonNewContainer,
    CustomFormInput,
    SearchForParent,
  },

  emits: ['updateStep', 'updateForm'],
  props: {
    stepIndex: {
      type: Number,
      required: true,
    },
    sectionId: {
      type: Number,
      required: true,
    },
    objectForm: {
      type: Object,
      required: true,
    },
    responseObject: {
      type: Array,
      required: true,
    },
    dataProfile: {
      type: Object,
    },
    approvedStep: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const objectFormReactive: Ref<any> = ref(props.objectForm);
    const showSearchForParent = ref(true);
    const parents: Ref<any[]> = ref([]);
    const convocationEnrolId = ref();
    const loadingDetail = ref(false);
    const loadingForm = ref(false);
    const loading = ref(true);
    const route = useRoute();
    const detail = ref();
    const stepId = ref();

    const convocationEnrolStepId = ref();
    const keyPredefinedForm = ref();
    const numberResponse = ref();
    const saveProcedure = ref();
    const getProcedure = ref();
    const questions = ref();
    const peopleId = ref();
    const surveyId = ref();

    onMounted(async () => {
      loading.value = true;

      try {
        if (!props.dataProfile) {
          convocationEnrolId.value = parseInt(String(route.params.convocationEnrollId ?? route.query.convocationEnrollId), 10);
          stepId.value = parseInt(String(route.params.stepId ?? route.query.stepId), 10);
        }

        numberResponse.value = null;

        await loadDetail();
        clearForm();

        keyPredefinedForm.value = detail.value.keyPredefinedForm;
        saveProcedure.value = detail.value.saveProcedure;
        getProcedure.value = detail.value.getProcedure;
        questions.value = detail.value.questions;
        surveyId.value = detail.value.surveyId;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const skipForm = computed(() => {
      let skipForm = true;

      if (detail.value?.questions) {
        detail.value.questions.forEach((questionRes: any) => {
          if (skipForm) {
            if (questionRes.required) skipForm = false;
          }
        });
      }

      return skipForm;
    });

    const loadDataPeople = (data: any) => {
      if (data.people) {
        loadingForm.value = true;
        peopleId.value = data.people.id;

        if (data.answers.length) {
          data.answers.forEach((dataAnswer: any) => {
            let question = detail.value.questions.filter((detailQuestion: any) => detailQuestion.id == dataAnswer.questionId)[0];

            if (question.typeData == 'falso_verdadero') {
              if (dataAnswer.rowId) {
                objectFormReactive.value.form['question_' + dataAnswer.questionId] = dataAnswer.rowId ? true : false;
              } else {
                objectFormReactive.value.form['question_' + dataAnswer.questionId] = dataAnswer.detail == '1' ? true : false;
              }
            } else if (dataAnswer.rowId) {
              objectFormReactive.value.form['question_' + dataAnswer.questionId] = dataAnswer.rowId;
            } else {
              objectFormReactive.value.form['question_' + dataAnswer.questionId] = dataAnswer.detail;
            }
          });
        } else {
          detail.value.questions.forEach((questionRes: any) => {
            let keysData = Object.keys(data.people);
            if (keysData.includes(questionRes.fieldName)) {
              objectFormReactive.value.form['question_' + questionRes.id] = data.people[questionRes.fieldName];
            }
          });
        }

        setTimeout(() => {
          loadingForm.value = false;
          showSearchForParent.value = false;
        }, 100);
      } else {
        clearForm(false);
      }
    };

    const loadDetail = async () => {
      loadingDetail.value = true;
      parents.value = [];

      try {
        let params = {
          id: stepId.value,
          convocationEnrolId: convocationEnrolId.value,
        };

        let res: any;

        if (!props.dataProfile) {
          res = await getConvocationStepWithDetailService.run(params);
        } else {
          res = props.dataProfile;

          let roleId = localStorage.getItem('roleId');
          res.detail.forEach((detail: any) => {
            detail.questions.forEach((question: any) => {
              question.blockQuestion = question.rolesIdsBlocked && question.rolesIdsBlocked.split(',').includes(roleId) ? true : false;
            });
          });
        }

        convocationEnrolStepId.value = res.convocationEnrolStepId;

        let counter = 0;

        while (counter < res.detail.length) {
          if (res.detail[counter].id == props.sectionId) {
            detail.value = res.detail[counter];

            const params = {
              convocationEnrolId: convocationEnrolId.value,
              convocationStepId: stepId.value,
            };
            const questionsAndresponses: any = await getQuestionsOfEnrolService.run(props.sectionId, params);

            detail.value.questions = questionsAndresponses.questions;
            detail.value.responses = questionsAndresponses.responses;
          }

          counter += 1;
        }

        detail.value.responses.forEach((res: any) => {
          parents.value.push({
            numberResponse: res.numberResponse,
            key: res.answers[0].detail,
          });
        });
      } catch (e) {
        console.log(e);
      }

      loadingDetail.value = false;
    };

    const loadAnswers = async (numberResponseParent: number) => {
      await clearForm(false);

      loadingForm.value = true;

      detail.value.responses.forEach((res: any) => {
        if (res.numberResponse == numberResponseParent) {
          res.answers.forEach((answer: any) => {
            let question = detail.value.questions.filter((question: any) => question.id == answer.questionId);

            if (question[0].typeData == 'falso_verdadero') {
              objectFormReactive.value.form['question_' + answer.questionId] = answer.rowId == 0 ? false : true;
            } else {
              objectFormReactive.value.form['question_' + answer.questionId] = answer.rowId ?? answer.detail ?? answer.detailsAnswerOption;
            }
          });

          numberResponse.value = numberResponseParent;
        }
      });

      setTimeout(() => {
        loadingForm.value = false;
      }, 100);
    };

    const clearForm = async (showSearch: boolean = true) => {
      loadingForm.value = true;

      numberResponse.value = null;
      peopleId.value = null;

      detail.value.questions.forEach((question: any) => {
        if (question.typeData == 'falso_verdadero') objectFormReactive.value.form['question_' + question.id] = false;
        else objectFormReactive.value.form['question_' + question.id] = null;
      });

      setTimeout(() => {
        loadingForm.value = false;
        showSearchForParent.value = showSearch;
      }, 100);
    };

    const updateStep = async (value: boolean) => {
      if (value) {
        await loadDetail();
        clearForm();

        emit('updateForm');
      }
    };

    const manageStep = (stepIndex: number) => {
      if (stepIndex < 1) emit('updateStep', false);
      else emit('updateStep', true);
    };

    return {
      loading,

      convocationEnrolStepId,
      showSearchForParent,
      objectFormReactive,
      keyPredefinedForm,
      numberResponse,
      loadingDetail,
      saveProcedure,
      getProcedure,
      loadingForm,
      questions,
      surveyId,
      peopleId,
      skipForm,
      parents,
      stepId,

      loadDataPeople,
      loadAnswers,
      manageStep,
      updateStep,
      clearForm,
    };
  },
});
</script>

<style scoped></style>
