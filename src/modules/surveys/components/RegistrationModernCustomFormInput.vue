<template>
  <AppLoading v-if="loading"></AppLoading>

  <template v-else>
    <div class="modern-custom-form-input">
      <section v-for="group in questionGroups" :key="group.key" class="modern-custom-form-input__group">
        <header class="modern-custom-form-input__groupHeader">
          <div class="modern-custom-form-input__groupIdentity">
            <div :class="['modern-custom-form-input__groupIcon', `modern-custom-form-input__groupIcon--${group.tone}`]">
              <AppIcon :icon="group.icon" />
            </div>

            <div class="modern-custom-form-input__groupText">
              <h3 class="modern-custom-form-input__groupTitle">
                {{ group.title }}
              </h3>
              <p v-if="group.description" class="modern-custom-form-input__groupDescription">
                {{ group.description }}
              </p>
            </div>
          </div>
        </header>

        <div v-for="(questionRow, rowIndex) in group.rows" :key="`${group.key}-${rowIndex}`" class="form-row modern-custom-form-input__row">
          <div
            v-for="question in questionRow"
            :key="question.id"
            :class="[
              'modern-custom-form-input__cell',
              {
                'modern-custom-form-input__cell--full': isFullWidthQuestion(question),
              },
            ]"
          >
            <AppFormField
              v-if="question.questionType == 'Abierta' || ((question.questionTypeId == 3 || question.questionTypeId == 2) && question.typeData == 'falso_verdadero')"
              :class="question.typeData == 'falso_verdadero' ? 'form-check form-switch' : ''"
              :form-control="v$.form['question_' + question.id]"
              :label="question.text"
            >
              <AppVoiceInput
                v-if="question.typeData == 'texto_largo'"
                :disabled="question.blockQuestion || approvedStep"
                v-model="v$.form['question_' + question.id].$model"
                textareaClass="form-control"
              />

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

            <template v-else-if="['Selección única', 'Selección múltiple'].includes(question.questionType)">
              <div v-if="selectWithService.includes(question.typeData)" class="modern-custom-form-input__service">
                <MunicipalitiesSearchEngine
                  v-if="question.typeData == 'Ciudades'"
                  :approved-step="approvedStep"
                  :default-label-municipality="question.text"
                  :field-key="'question_' + question.id"
                  :is-required="dataV['question_' + question.id]"
                  :municipality-id="v$.form['question_' + question.id].$model"
                  @selected-municipality="selectedMunicipality"
                ></MunicipalitiesSearchEngine>

                <DepartmentSearchEngine
                  v-else-if="question.typeData == 'Departamentos'"
                  :approved-step="approvedStep"
                  :default-label-department="question.text"
                  :field-key="'question_' + question.id"
                  :is-required="dataV['question_' + question.id]"
                  :department-id="v$.form['question_' + question.id].$model"
                  @selected-department="selectedDepartment"
                ></DepartmentSearchEngine>

                <CountrySearchEngine
                  v-else-if="question.typeData == 'Paises'"
                  :approved-step="approvedStep"
                  :default-label-country="question.text"
                  :field-key="'question_' + question.id"
                  :is-required="dataV['question_' + question.id]"
                  :country-id="v$.form['question_' + question.id].$model"
                  @selected-country="selectedCountry"
                ></CountrySearchEngine>

                <SelectWithService
                  v-else
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

              <AppFormField v-else :form-control="v$.form['question_' + question.id]" :label="question.text">
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
            </template>
          </div>
        </div>
      </section>
    </div>
  </template>

  <div class="d-flex justify-content-end gap-2 mt-3">
    <AppButton v-if="!isMatriz" :disabled="stepIndex == 1" :label="'Atrás'" outlined @click="manageStep(0)"></AppButton>

    <AppButton v-if="!isMatriz && !isLastSection" :label="'Siguiente'" @click="manageStep(1)"></AppButton>

    <AppButton v-if="!isMatriz && isLastSection" :label="'Guardar'" @click="save()"></AppButton>

    <AppButton :disabled="approvedStep" v-if="isMatriz && numberResponse" :label="'Eliminar'" outlined @click="deleteAnswers()"></AppButton>

    <AppButton :disabled="approvedStep" v-if="isMatriz" :label="'Guardar'" @click="save()"></AppButton>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref } from 'vue';
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
import AppIcon from '../../../shared/components/AppIcon.vue';

import { QuestionDto, AnswerOptionDto } from '../dtos/stepTypeFormulario.dto';

import { DeleteAnswersService } from '../services/deleteAnswers.service';
import { SaveAnswersCustomSectionService } from '../services/saveAnswersCustomSection.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const saveAnswersCustomSectionService = new SaveAnswersCustomSectionService();
const deleteAnswersService = new DeleteAnswersService();

interface QuestionGroupItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  tone: string;
  rows: QuestionDto[][];
}

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();

const includesAny = (value: string, patterns: string[]) => patterns.some((pattern) => value.includes(pattern));

const getQuestionSearchText = (question: QuestionDto) => normalizeText([question.text, question.fieldName, question.typeData].filter(Boolean).join(' '));

const groupQuestionRows = (questions: QuestionDto[], isFullWidthQuestion: (question: QuestionDto) => boolean) => {
  const rows: QuestionDto[][] = [];
  let currentRow: QuestionDto[] = [];

  questions.forEach((question) => {
    if (isFullWidthQuestion(question)) {
      if (currentRow.length) {
        rows.push(currentRow);
        currentRow = [];
      }

      rows.push([question]);
      return;
    }

    currentRow.push(question);

    if (currentRow.length === 2) {
      rows.push(currentRow);
      currentRow = [];
    }
  });

  if (currentRow.length) rows.push(currentRow);

  return rows;
};

export default defineComponent({
  name: 'RegistrationModernCustomFormInput',
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
    AppIcon,
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
    sectionTitle: {
      type: String,
      default: '',
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
    convocationStepId: {
      type: Number,
      default: null,
    },
    isLastSection: {
      type: Boolean,
      default: false,
    },
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

    const normalizedSectionTitle = computed(() => normalizeText(props.sectionTitle));

    const isFullWidthQuestion = (question: QuestionDto) => {
      const questionText = getQuestionSearchText(question);

      return ['texto_largo', 'Ciudades', 'Departamentos'].includes(question.typeData) || includesAny(questionText, ['direccion', 'address', 'observ', 'coment']);
    };

    const getPersonalGroupKey = (question: QuestionDto) => {
      const questionText = getQuestionSearchText(question);

      if (includesAny(questionText, ['exped', 'emision', 'issu', 'identificationmunicipality', 'identificationregion', 'identificationcountry', 'lugar de documento'])) {
        return 'expedition';
      }

      if (includesAny(questionText, ['nacim', 'birth'])) {
        return 'birth';
      }

      if (includesAny(questionText, ['correo', 'email', 'mail', 'telefono', 'phone', 'celular', 'mobile', 'whatsapp', 'contact'])) {
        return 'contact';
      }

      if (includesAny(questionText, ['identif', 'document', 'cedula', 'dni', 'pasaporte', 'passport'])) {
        return 'document';
      }

      if (includesAny(questionText, ['direccion', 'address', 'resid', 'barrio', 'localidad', 'homemunicipality', 'country', 'region', 'municipality', 'municipio', 'departamento', 'ciudad'])) {
        return 'residence';
      }

      if (includesAny(questionText, ['nombre', 'apellido', 'genero', 'sexo', 'gender', 'religion', 'nacionalidad', 'nationality', 'idioma', 'language', 'civil'])) {
        return 'basic';
      }

      return 'complementary';
    };

    const getAcademicGroupKey = (question: QuestionDto) => {
      const questionText = getQuestionSearchText(question);

      if (includesAny(questionText, ['colegio', 'institucion', 'institution', 'procedencia', 'school'])) {
        return 'origin';
      }

      if (includesAny(questionText, ['grado', 'titulo', 'degree', 'gradu', 'bachiller', 'year', 'ano'])) {
        return 'formation';
      }

      if (includesAny(questionText, ['icfes', 'saber', 'puntaje', 'promedio', 'gpa', 'resultado', 'score'])) {
        return 'results';
      }

      return 'trajectory';
    };

    const getAdditionalGroupKey = (question: QuestionDto) => {
      const questionText = getQuestionSearchText(question);

      if (includesAny(questionText, ['beca', 'scholar', 'beneficio', 'apoyo', 'sisben', 'eps', 'estrato'])) {
        return 'support';
      }

      if (includesAny(questionText, ['coment', 'observ', 'adicional', 'nota'])) {
        return 'notes';
      }

      if (includesAny(questionText, ['motiva', 'hear', 'conocio', 'interes', 'programa'])) {
        return 'preferences';
      }

      return 'context';
    };

    const buildQuestionGroups = (questions: QuestionDto[]) => {
      const groups: Record<
        string,
        {
          title: string;
          description: string;
          icon: string;
          tone: string;
          questions: QuestionDto[];
        }
      > = {};
      let definitions: {
        key: string;
        title: string;
        description: string;
        icon: string;
        tone: string;
      }[] = [];
      let resolveGroupKey = () => 'general';

      if (normalizedSectionTitle.value.includes('personal')) {
        definitions = [
          {
            key: 'basic',
            title: 'Datos personales',
            description: 'Nombres, apellidos y datos básicos del aspirante.',
            icon: 'user-circle',
            tone: 'blue',
          },
          {
            key: 'document',
            title: 'Documento de identidad',
            description: 'Tipo y número del documento que usarás en el proceso.',
            icon: 'id-card',
            tone: 'purple',
          },
          {
            key: 'expedition',
            title: 'Expedición del documento',
            description: 'Ciudad, departamento, país o fecha donde fue expedido.',
            icon: 'map-marker-alt',
            tone: 'orange',
          },
          {
            key: 'birth',
            title: 'Nacimiento',
            description: 'Fecha y lugar de nacimiento para validar tu perfil.',
            icon: 'calendar-alt',
            tone: 'teal',
          },
          {
            key: 'residence',
            title: 'Residencia',
            description: 'Ubicación y dirección actual de residencia.',
            icon: 'home',
            tone: 'green',
          },
          {
            key: 'contact',
            title: 'Contacto',
            description: 'Canales para notificaciones y seguimiento de la admisión.',
            icon: 'envelope',
            tone: 'blue',
          },
          {
            key: 'complementary',
            title: 'Información complementaria',
            description: 'Otros datos personales solicitados en esta sección.',
            icon: 'info-circle',
            tone: 'slate',
          },
        ];
        resolveGroupKey = getPersonalGroupKey;
      } else if (normalizedSectionTitle.value.includes('acad')) {
        definitions = [
          {
            key: 'trajectory',
            title: 'Trayectoria académica',
            description: 'Información general de tu recorrido académico.',
            icon: 'graduation-cap',
            tone: 'blue',
          },
          {
            key: 'origin',
            title: 'Institución de procedencia',
            description: 'Datos del colegio, institución o lugar de estudios previos.',
            icon: 'university',
            tone: 'green',
          },
          {
            key: 'formation',
            title: 'Nivel y formación',
            description: 'Último grado, título o formación alcanzada.',
            icon: 'book-open',
            tone: 'purple',
          },
          {
            key: 'results',
            title: 'Resultados y soporte',
            description: 'Promedios, puntajes o resultados relacionados con tu postulación.',
            icon: 'medal',
            tone: 'orange',
          },
        ];
        resolveGroupKey = getAcademicGroupKey;
      } else if (normalizedSectionTitle.value.includes('adicional')) {
        definitions = [
          {
            key: 'context',
            title: 'Contexto personal',
            description: 'Datos adicionales que ayudan a contextualizar tu solicitud.',
            icon: 'info-circle',
            tone: 'blue',
          },
          {
            key: 'support',
            title: 'Apoyos y beneficios',
            description: 'Información sobre becas, apoyos o condiciones especiales.',
            icon: 'shield-alt',
            tone: 'green',
          },
          {
            key: 'preferences',
            title: 'Preferencias y motivación',
            description: 'Intereses, expectativas o referencias de cómo conociste la convocatoria.',
            icon: 'bullseye',
            tone: 'purple',
          },
          {
            key: 'notes',
            title: 'Observaciones',
            description: 'Comentarios u observaciones finales de la sección.',
            icon: 'comment-alt',
            tone: 'orange',
          },
        ];
        resolveGroupKey = getAdditionalGroupKey;
      } else {
        definitions = [
          {
            key: 'general',
            title: 'Información de la sección',
            description: 'Completa los campos requeridos para continuar.',
            icon: 'file-alt',
            tone: 'slate',
          },
        ];
      }

      definitions.forEach((definition) => {
        groups[definition.key] = {
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          tone: definition.tone,
          questions: [],
        };
      });

      questions.forEach((question) => {
        const groupKey = resolveGroupKey(question);
        const fallbackKey = definitions[0]?.key ?? 'general';
        const safeGroupKey = groups[groupKey] ? groupKey : fallbackKey;

        groups[safeGroupKey].questions.push(question);
      });

      return definitions
        .filter((definition) => groups[definition.key]?.questions.length)
        .map(
          (definition): QuestionGroupItem => ({
            key: definition.key,
            title: definition.title,
            description: definition.description,
            icon: definition.icon,
            tone: definition.tone,
            rows: groupQuestionRows(groups[definition.key].questions, isFullWidthQuestion),
          })
        );
    };

    const questionGroups = computed(() => buildQuestionGroups(props.questions));

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
            convocationStepId: props.convocationStepId ?? stepId.value,
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
      questionGroups,
      v$,

      selectWithService,
      typeFieldInput,
      getDataSelect,
      saveThisForm,
      typeData,
      dataV,
      isFullWidthQuestion,

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
.modern-custom-form-input {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modern-custom-form-input__group {
  padding: 1.1rem 1.1rem 0.35rem;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 48%);
}

.modern-custom-form-input__groupHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.45rem;
}

.modern-custom-form-input__groupIdentity {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.modern-custom-form-input__groupText {
  display: flex;
  flex-direction: column;
}

.modern-custom-form-input__groupIcon {
  width: 2.8rem;
  height: 2.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 1rem;
  flex-shrink: 0;
}

.modern-custom-form-input__groupIcon--blue {
  background: #eff6ff;
  color: #2563eb;
}

.modern-custom-form-input__groupIcon--green {
  background: #f0fdf4;
  color: #15803d;
}

.modern-custom-form-input__groupIcon--purple {
  background: #faf5ff;
  color: #7c3aed;
}

.modern-custom-form-input__groupIcon--orange {
  background: #fff7ed;
  color: #c2410c;
}

.modern-custom-form-input__groupIcon--teal {
  background: #f0fdfa;
  color: #0d9488;
}

.modern-custom-form-input__groupIcon--slate {
  background: #f1f5f9;
  color: #475569;
}

.modern-custom-form-input__groupTitle {
  margin: 0 0 0.2rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
}

.modern-custom-form-input__groupDescription {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.88rem;
}

.modern-custom-form-input__row {
  margin-top: 0.75rem;
}

.modern-custom-form-input__cell {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
}

.modern-custom-form-input__cell--full {
  flex-basis: 100%;
}

.modern-custom-form-input__service {
  width: 100%;
}

.disabledSelect {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6 !important;
  border-color: #d1dbe5;
}

@media (max-width: 768px) {
  .modern-custom-form-input__group {
    padding: 1rem 0.9rem 0.25rem;
    border-radius: 18px;
  }

  .modern-custom-form-input__groupHeader {
    margin-bottom: 0.25rem;
  }

  .modern-custom-form-input__groupIdentity {
    gap: 0.75rem;
  }

  .modern-custom-form-input__groupIcon {
    width: 2.55rem;
    height: 2.55rem;
    border-radius: 12px;
  }

  .modern-custom-form-input__cell,
  .modern-custom-form-input__cell--full {
    flex-basis: 100%;
  }
}
</style>
