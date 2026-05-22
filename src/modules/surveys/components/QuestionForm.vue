<template>
  <form @submit.prevent="save">
    <AppLoading v-if="loading"></AppLoading>

    <AppFormModal v-else-if="!loading" :title="data?.id ? 'Editar pregunta' : 'Nueva pregunta'">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.text" :label="'Pregunta'">
            <input id="text" type="text" class="form-control" v-model="v$.form.text.$model" />
          </AppFormField>

          <div class="col d-flex align-items-end">
            <AppFormField :form-control="v$.form.required" class="form-check form-switch" :label="'Es obligatoria?'">
              <input class="form-check-input" type="checkbox" :disabled="!!data?.fieldDefaultRequired" v-model="v$.form.required.$model" />
            </AppFormField>
          </div>
        </div>

        <template v-if="!isCustomFieldSurvey">
          <AppFormField :form-control="v$.form.rolesIdsBlocked" :label="'Bloquear para roles'">
            <AppAutocomplete v-model="v$.form.rolesIdsBlocked.$model" :options="roles" :multiple="true" />
          </AppFormField>
        </template>

        <div class="form-row">
          <AppFormField :form-control="v$.form.questionTypeId" :label="'Tipo pregunta'">
            <AppAutocomplete
              v-bind:class="{
                disabledSelect: data?.fieldDefaultRequired || data?.fieldId != null,
              }"
              v-model="v$.form.questionTypeId.$model"
              :clearable="false"
              :options="questionTypes"
            />
          </AppFormField>

          <!-- v-bind:class="{
            disabledSelect: data?.fieldDefaultRequired || data?.fieldId != null || isSelectUnica,
            :disabled="isSelectUnica"
          }" -->
          <AppFormField :form-control="v$.form.typeDataId" :label="'Formato respuesta'">
            <AppAutocomplete
              v-bind:class="{
                disabledSelect: data?.fieldDefaultRequired || data?.fieldId != null,
              }"
              v-model="v$.form.typeDataId.$model"
              :options="typesData"
            />
          </AppFormField>
        </div>

        <template v-if="showAnswerOptions">
          <hr />
          <h3 class="h6 lead">Opciones de respuesta</h3>
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th>Opción</th>
                <th>Valor</th>

                <template v-if="!isCustomFieldSurvey">
                  <th>Require aclaración?</th>
                </template>
                <th></th>
              </tr>
            </thead>

            <template v-if="!v$.form.answerOptions.$model.length">
              <tbody>
                <tr>
                  <td :colspan="!isCustomFieldSurvey ? 5 : 4">
                    <AppEmptyResponse />
                  </td>
                </tr>
              </tbody>
            </template>

            <draggable v-model="v$.form.answerOptions.$model" tag="tbody" item-key="id">
              <template v-slot:item="{ element, index }">
                <tr :key="element.id" class="tw-cursor-pointer">
                  <td><AppIcon icon="arrows-alt"></AppIcon></td>
                  <td>
                    <input type="text" class="form-control" v-model="element.text" />
                  </td>
                  <td>
                    <input type="text" class="form-control" v-model="element.value" />
                  </td>

                  <template v-if="!isCustomFieldSurvey">
                    <td>
                      <div class="d-flex flex-column justify-content-center align-items-center">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" v-model="element.isOpen" />
                        </div>
                      </div>
                    </td>
                  </template>

                  <td>
                    <AppButtonDelete @click="deleteAnswerOption(index)" />
                  </td>
                </tr>
              </template>
            </draggable>
          </table>

          <AppButtonNewContainer text="core.new" @click="addAnswerOption" />
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save" />
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue';
import draggable from 'vuedraggable';

import { useVuelidate } from '@vuelidate/core';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { QUESTION_TYPES, TYPES_DATA } from '../constant/questionData.constant';
import { QuestionsWithAnswerOptionsConstant } from '../../../shared/constant/questionsWithAnswerOptions.constant';

import { QuestionDto } from '../dtos/question.dto';
import { TypesDataDto } from '../dtos/typesData.dto';
import { AnswerOptionDto } from '../dtos/answerOption.dto';
import { QuestionTypeDto } from '../dtos/questionType.dto';

import { GetRolesService } from '../services/getRoles.service';
import { CreateOrUpdateQuestionService } from '../services/createOrUpdateQuestion.service';
import { GetRelatedDataQuestionFormService } from '../services/getRelatedDataQuestionForm.service';

const getRelatedDataQuestionFormService = new GetRelatedDataQuestionFormService();
const createOrUpdateQuestionService = new CreateOrUpdateQuestionService();
const getRolesService = new GetRolesService();

export default defineComponent({
  name: 'QuestionForm',
  components: {
    AppButtonNewContainer,
    AppEmptyResponse,
    AppButton,
    AppButtonDelete,
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppLoading,
    draggable,
    AppIcon,
  },

  props: {
    data: {
      type: Object as () => QuestionDto | null,
      default: null,
    },
    isCustomFieldSurvey: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const questionTypes = ref<QuestionTypeDto[]>([]);
    const typesData = ref<TypesDataDto[]>([]);
    const roles = ref<any[]>([]);

    const loading = ref(true);

    const isSelectUnica = computed(() => {
      const sel = questionTypes.value.find((q) => q.id === form.questionTypeId);
      return sel?.name === 'Selección única';
    });
    const showAnswerOptions = computed(() => {
      return QuestionsWithAnswerOptionsConstant.includes(form.questionTypeId as number);
    });

    const form = reactive<any>({
      text: props.data?.text,
      required: !!props.data?.required,
      questionTypeId: props.data?.questionTypeId,
      typeDataId: props.data?.typeDataId,
      rolesIdsBlocked: [] as number[],
      answerOptions: [] as AnswerOptionDto[],
    });
    const v$ = useVuelidate(
      {
        form: {
          text: { required },
          required: {},
          questionTypeId: { required },
          typeDataId: {
            requiredIf: requiredIf(() => !isSelectUnica.value),
          },
          rolesIdsBlocked: {},
          answerOptions: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        roles.value = await getRolesService.run();

        if (!props.isCustomFieldSurvey) {
          const response = await getRelatedDataQuestionFormService.run();

          questionTypes.value = response.questionTypes;
          typesData.value = response.typesData;
        } else {
          questionTypes.value = QUESTION_TYPES;
          typesData.value = TYPES_DATA;
        }

        if (props.data?.id) {
          props.data.answerOptions?.forEach((answerOption) => {
            answerOption.isOpen = Boolean(answerOption.isOpen);
          });

          form.answerOptions = props.data.answerOptions;
          form.rolesIdsBlocked = parseRolesIds(props.data.rolesIdsBlocked);
        }
      } catch (error) {
        console.error('Error al montar el componente:', error);
      } finally {
        loading.value = false;
      }
    });

    watch(
      () => form.questionTypeId,
      (newId) => {
        const selectedType = questionTypes.value.find((item) => item.id === newId);
        console.log('🚀 ~ setup ~ selectedType:', selectedType);
        console.log('🚀 ~ setup ~ selectedType:', v$.value);
        // Si es "Selección única", limpiar el valor de typeDataId
        if (isSelectUnica.value) form.typeDataId = null;
      }
    );

    const parseRolesIds = (rolesIdsBlocked: string | null): number[] => {
      if (!rolesIdsBlocked) return [];

      return rolesIdsBlocked
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((num) => !isNaN(num));
    };

    const addAnswerOption = () => {
      const newAnswerOption: any = {
        text: '',
        isOpen: 0,
        value: '',
        order: form.answerOptions.length + 1,
      };

      form.answerOptions.push(newAnswerOption);
    };
    const deleteAnswerOption = (index: number) => {
      form.answerOptions.splice(index, 1);
    };

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        form.answerOptions.forEach((answerOption: AnswerOptionDto, key: number) => {
          answerOption.order = key + 1;
        });

        const dataSend: any = {
          ...form,
          rolesIdsBlocked: form.rolesIdsBlocked.toString() ? form.rolesIdsBlocked.toString() : null,
          surveySectionId: props.data?.surveySectionId,
          order: props.data?.order,
        };

        await createOrUpdateQuestionService.run(dataSend, props.data?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      v$,

      showAnswerOptions,
      isSelectUnica,
      loading,

      questionTypes,
      typesData,
      roles,

      deleteAnswerOption,
      addAnswerOption,
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
