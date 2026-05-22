<template>
  <AppLoading v-if="loading"></AppLoading>
  <template v-else>
    <div class="mb-3 tw-flex-1" v-for="(question, index) in questions" :key="index">
      <div v-if="question.questionType == 'Abierta' || ((question.questionTypeId == 3 || question.questionTypeId == 2) && question.typeData == 'falso_verdadero')">
        <AppFormField :class="question.typeData == 'falso_verdadero' ? 'form-check form-switch' : ''" :form-control="v$.form['question_' + question.id]" :label="question.text">
          <AppVoiceInput v-if="question.typeData == 'texto_largo'" :disabled="question.blockQuestion || approvedStep" v-model="v$.form['question_' + question.id].$model" textareaClass="form-control"  />
          <input
            v-if="question.typeData == 'falso_verdadero'"
            v-model="v$.form['question_' + question.id].$model"
            :disabled="question.blockQuestion || approvedStep"
            class="form-check-input"
            type="checkbox"
          />

          <input
            v-if="typeFieldInput.includes(question.typeData)"
            v-model="v$.form['question_' + question.id].$model"
            :disabled="question.blockQuestion || approvedStep"
            :type="typeData[question.typeData]"
            class="form-control"
          />

          <input
            v-else-if="!typeFieldInput.includes(question.typeData) && !['falso_verdadero', 'texto_largo'].includes(question.typeData)"
            v-model="v$.form['question_' + question.id].$model"
            :disabled="question.blockQuestion || approvedStep"
            class="form-control"
            type="text"
          />
        </AppFormField>
      </div>

      <div v-else-if="['Selección única', 'Selección múltiple'].includes(question.questionType)">
        <div v-if="selectWithService.includes(question.typeData)">
          <MunicipalitiesSearchEngine
            :approved-step="approvedStep"
            v-if="question.typeData == 'Ciudades'"
            :default-label-municipality="question.text"
            :field-key="'question_' + question.id"
            :is-required="dataV['question_' + question.id]"
            :municipalityId="v$.form['question_' + question.id].$model"
            @selected-municipality="selectedMunicipality"
          ></MunicipalitiesSearchEngine>

          <DepartmentSearchEngine
            :approved-step="approvedStep"
            v-else-if="question.typeData == 'Departamentos'"
            :default-label-department="question.text"
            :field-key="'question_' + question.id"
            :is-required="dataV['question_' + question.id]"
            :departmentId="v$.form['question_' + question.id].$model"
            @selected-department="selectedDepartment"
          ></DepartmentSearchEngine>

          <CountrySearchEngine
            :approved-step="approvedStep"
            v-else-if="question.typeData == 'Paises'"
            :default-label-country="question.text"
            :field-key="'question_' + question.id"
            :is-required="dataV['question_' + question.id]"
            :country-id="v$.form['question_' + question.id].$model"
            @selected-country="selectedCountry"
          ></CountrySearchEngine>

          <div v-else>
            <SelectWithService
              :approved-step="approvedStep"
              v-bind:class="{ disabledSelect: !saveThisForm }"
              :label="question.text"
              :block-question="question.blockQuestion"
              :service-key="question.typeData"
              :field-key="'question_' + question.id"
              :is-required="dataV['question_' + question.id]"
              :answer="v$.form['question_' + question.id].$model"
              @selected-option="selectedOption"
            ></SelectWithService>
          </div>
        </div>

        <div v-else>
          <AppFormField :form-control="v$.form['question_' + question.id]" :label="question.text">
            <div class="row">
              <div class="col">
                <AppAutocomplete
                  :disabled="question.blockQuestion || approvedStep"
                  v-model="v$.form['question_' + question.id].$model"
                  :multiple="question.questionTypeId == 2"
                  :options="question.answerOptions"
                  :label="'text'"
                ></AppAutocomplete>
              </div>

              <div v-if="isOpen(v$.form['question_' + question.id].$model, question.answerOptions)" class="col">
                <input
                  :disabled="question.blockQuestion || approvedStep"
                  v-model="question.answer"
                  class="form-control"
                  type="text"
                  pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                  title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                />
              </div>
            </div>
          </AppFormField>
        </div>
      </div>
    </div>
  </template>

  <div class="d-flex justify-content-end gap-1">
    <AppButton v-if="!isMatriz" :disabled="stepIndex == 1" :label="'Atrás'" outlined @click="manageStep(0)"></AppButton>

    <AppButton v-if="!isMatriz" :label="'Siguiente'" @click="manageStep(1)"></AppButton>

    <AppButton :disabled="approvedStep" v-if="isMatriz && numberResponse" :label="'Eliminar'" outlined @click="deleteAnswers()"></AppButton>

    <AppButton :disabled="approvedStep" v-if="isMatriz" :label="'Guardar'" @click="save()"></AppButton>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';

import SelectWithService from './SelectWithService.vue';
import CountrySearchEngine from './CountrySearchEngine.vue';
import DepartmentSearchEngine from './DepartmentSearchEngine.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import MunicipalitiesSearchEngine from './MunicipalitiesSearchEngine.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { QuestionDto, AnswerOptionDto } from '../dtos/stepTypeFormulario.dto';

import { DeleteAnswersService } from '../services/deleteAnswers.service';
import { SaveAnswersCustomSectionService } from '../services/saveAnswersCustomSection.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const saveAnswersCustomSectionService = new SaveAnswersCustomSectionService();
const deleteAnswersService = new DeleteAnswersService();

export default defineComponent({
  name: 'CustomFormInput',
  components: {
    MunicipalitiesSearchEngine,
    DepartmentSearchEngine,
    CountrySearchEngine,
    SelectWithService,
    AppAutocomplete,
    AppFormField,
    AppLoading,
    AppButton,
    AppVoiceInput,
  },

  emits: ['updateStep'],
  props: {
    surveyId: {
      type: Number,
    },
    saveProcedure: {
      type: String,
    },
    getProcedure: {
      type: String,
    },
    questions: {
      type: Array as PropType<QuestionDto[]>,
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
    stepIndex: {
      type: Number,
      required: true,
    },
    responseObject: {
      type: Array,
      required: true,
    },
    isMatriz: {
      type: Boolean,
      default: false,
    },
    approvedStep: {
      type: Boolean,
      default: false,
    },
    peopleId: {},
    numberResponse: {},
    keyPredefinedForm: {},
    convocationEnrolStepId: {},
  },

  setup(props, { emit }) {
    const responseObject = props.responseObject ?? [];
    const dataForm = props.objectForm?.form ?? {};
    const dataV = props.objectForm?.v$ ?? {};

    const convocationEnrolId = ref();
    const saveThisForm = ref(true);
    const convocationId = ref();
    const loading = ref(true);
    const route = useRoute();
    const stepId = ref();

    const selectWithService = ['Paises', 'Departamentos', 'Ciudades', 'curso_grupos_convocatoria', 'parentesco', 'tipo_identificacion', 'genero', 'grados_convocatoria'];
    const typeData: any = {
      fecha_hora: 'datetime-local',
      password: 'password',
      texto_corto: 'text',
      numerico: 'number',
      correo: 'email',
      fecha: 'date',
    };
    const typeFieldInput = ['texto_corto', 'correo', 'numerico', 'password', 'fecha', 'fecha_hora'];
    let getDataSelect: any = reactive({
      curso_grupos_convocatoria: [],
      tipo_identificacion: [],
      grados_convocatoria: [],
      parentesco: [],
      genero: [],
    });

    const form: any = reactive({ ...dataForm });
    const v$: any = useVuelidate(
      {
        form: { ...dataV },
      },
      { form }
    );

    onMounted(async () => {
      try {
        if (route.params.convocationEnrollId) {
          convocationEnrolId.value = parseInt(route.params.convocationEnrollId.toString(), 10);
          convocationId.value = parseInt(route.params.convocationId.toString(), 10);
          stepId.value = parseInt(route.params.stepId.toString(), 10);
        } else if (route.query.convocationEnrollId && route.query.stepId) {
          convocationEnrolId.value = parseInt(route.query.convocationEnrollId.toString(), 10);
          stepId.value = parseInt(route.query.stepId.toString(), 10);
        }

        props.questions.forEach((question: QuestionDto) => {
          if (question.questionTypeId == 3 && question.answer) {
            question.answer = parseInt(question.answer);
          }

          question.answerOptions.forEach((answer: AnswerOptionDto) => {
            question.answer = answer.detail ?? null;
          });
        });

        if (props.saveProcedure == 'saveMatriculate' && form[Object.keys(form)[0]]) {
          saveThisForm.value = false;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const selectedMunicipality = (value: any) => {
      form[value.key] = value.value;
    };
    const selectedDepartment = (value: any) => {
      form[value.key] = value.value;
    };
    const selectedCountry = (value: any) => {
      form[value.key] = value.value;
    };
    const selectedOption = (value: any) => {
      form[value.key] = value.value;
    };

    const manageStep = (stepIndex: number) => {
      if (stepIndex < 1) {
        emit('updateStep', false);
      } else {
        save();
      }
    };

    const isOpen = (vModel: any, answerOptions: AnswerOptionDto[]) => {
      let showInput = false;
      let arrVModel = Array.isArray(vModel) ? vModel : [vModel];

      answerOptions.forEach((answer: AnswerOptionDto) => {
        if (arrVModel.includes(answer.id) && answer.isOpen) {
          showInput = true;
        }
      });

      return showInput;
    };

    const loadAnswers = () => {
      let keyForm: any = '';

      responseObject.forEach((question: any) => {
        keyForm = 'question_' + question.id;

        if (question.answerOptions.length) {
          if (Array.isArray(form[keyForm])) {
            question.answerOptions.forEach((answer: any) => {
              if (form[keyForm].includes(answer.id)) {
                answer.selected = 1;

                if (answer.isOpen) {
                  props.questions.forEach((questio: any) => {
                    if (questio.id == question.id) answer.detail = questio.answer;
                  });
                }
              }
            });
          } else {
            question.answerOptions.forEach((answer: any) => {
              if (form[keyForm] == answer.id) {
                answer.selected = 1;

                if (answer.isOpen) {
                  props.questions.forEach((questio: any) => {
                    if (questio.id == question.id) answer.detail = questio.answer;
                  });
                }
              }
            });
          }
        } else {
          let questionRes: any = props.questions.filter((questio: any) => questio.id == question.id)[0];

          if (questionRes.typeData == 'falso_verdadero') {
            question.rowId = form[keyForm] ? 1 : 0;
            question.answer = form[keyForm] ? 'Si' : 'No';
          } else if (question.questionTypeId == 3 && typeof form[keyForm] === 'object') {
            if (form[keyForm]) {
              question.rowId = form[keyForm].id;
              question.answer = form[keyForm].name;
            } else {
              question.rowId = null;
              question.answer = null;
            }
          } else if (question.questionTypeId == 3 && questionRes.rowId) {
            question.rowId = questionRes.rowId;
            question.answer = form[keyForm];
          } else {
            question.answer = form[keyForm];
          }
        }
      });
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid && !props.approvedStep) return;

      try {
        if (saveThisForm.value) {
          await loadAnswers();

          let dataSend = {
            convocationEnrolId: convocationEnrolId.value,
            convocationStepId: stepId.value,
            saveProcedure: props.saveProcedure,
            numberResponse: props.numberResponse,
            peopleId: props.peopleId,
            surveyId: props.surveyId,
            questions: responseObject,
          };

          if (!props.approvedStep) await saveAnswersCustomSectionService.run(props.sectionId, dataSend);
        }

        emit('updateStep', true);
      } catch (e) {
        console.log(e);
      }
    };

    const deleteAnswers = async () => {
      try {
        let params = {
          surveySectionId: props.sectionId,
          numberResponse: props.numberResponse,
          convocationEnrolStepId: props.convocationEnrolStepId,
          keyPredefinedForm: props.keyPredefinedForm,
        };

        await deleteAnswersService.run(params);
        emit('updateStep', true);
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      v$,

      selectWithService,
      typeFieldInput,
      getDataSelect,
      saveThisForm,
      typeData,
      dataV,

      manageStep,
      isOpen,

      selectedMunicipality,
      selectedDepartment,
      selectedCountry,
      selectedOption,
      deleteAnswers,
      save,
    };
  },
});
</script>

<style scoped>
.disabledSelect {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6 !important;
  border-color: #d1dbe5;
}
</style>
