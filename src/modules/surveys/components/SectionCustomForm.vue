<template>
  <AppLoading v-if="loading"></AppLoading>
  <form v-else @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.title" :label="'Título'">
            <input id="title" type="text" class="form-control" v-model="v$.form.title.$model" />
          </AppFormField>

          <div class="col d-flex align-items-end">
            <AppFormField class="form-check form-switch" :form-control="v$.form.isMatriz" :label="'Mostrar la sección en matriz?'">
              <input :disabled="dataLc.value?.id ? true : false" v-model="v$.form.isMatriz.$model" class="form-check-input" type="checkbox" />
            </AppFormField>
          </div>
        </div>

        <AppFormField :form-control="v$.form.description" :label="'Descripción'">
          <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control"  />
        </AppFormField>

        <template v-if="dataLc.value?.predefinedFormId || !dataLc.value?.id">
          <AppFormField :form-control="v$.form.predefinedFormId" :label="'Campos predefinidos'">
            <AppAutocomplete :disabled="!!dataLc.value?.id" :options="predefinedForms.value" :label="'process'" v-model="v$.form.predefinedFormId.$model"></AppAutocomplete>
          </AppFormField>

          <AppLoading v-if="loadingFields"></AppLoading>

          <table class="table" v-else-if="fields.value.length">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Mostrar</th>
                <th>Descripción</th>
                <th>Obligatorio</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(field, index) in fields.value" :key="index">
                <td>
                  <div class="d-flex flex-column">
                    <span>{{ field.defaultLabel }}</span>
                    <span class="form-text help-text" v-if="field.defaultIsRequired"> Este campo no puede ser modificado </span>
                  </div>
                </td>
                <td>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" v-model="field.showField" :disabled="field.isRequired" />
                  </div>
                </td>
                <td>
                  <input type="text" class="form-control" v-model="field.label" />
                </td>
                <td>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" v-model="field.institutionRequired" :disabled="field.isRequired" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton> Guardar </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { SectionDto } from '../dtos/section.dto';
import { PredefinedFormDto } from '../dtos/predefinedForm.dto';

import { GetFieldsPredefinedFormService } from '../services/getFieldsPredefinedForm.service';
import { GetSectionCustomFormByIdService } from '../services/getSectionCustomFormById.service';
import { GetPredefinedFormsForSelectService } from '../services/getPredefinedFormsForSelect.service';
import { CreateOrUpdateSectionCustomFormService } from '../services/createOrUpdateSectionCustomForm.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateSectionCustomFormService = new CreateOrUpdateSectionCustomFormService();
const getPredefinedFormsForSelectService = new GetPredefinedFormsForSelectService();
const getSectionCustomFormByIdService = new GetSectionCustomFormByIdService();
const getFieldsPredefinedFormService = new GetFieldsPredefinedFormService();

export default defineComponent({
  name: 'SectionCustomForm',

  components: {
    AppAutocomplete,
    AppFormModal,
    AppFormField,
    AppLoading,
    AppButton,
    AppVoiceInput,
  },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    const route = useRoute();

    const surveyId = route.params.formId;

    const predefinedForms: { value: PredefinedFormDto[] } = reactive({
      value: [],
    });
    const dataLc: { value: SectionDto } = reactive({
      value: props.data,
    });
    const fields: { value: any[] } = reactive({
      value: [],
    });

    let title = dataLc.value?.id ? 'Editar sección' : 'Nueva sección';
    const loadingFields = ref(false);
    const loading = ref(true);

    const form = reactive({
      title: dataLc.value?.title,
      isMatriz: dataLc.value?.isMatriz ? true : false,
      description: dataLc.value?.description,
      predefinedFormId: dataLc.value?.predefinedFormId,
    });
    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          isMatriz: {},
          description: {},
          predefinedFormId: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      if (dataLc.value?.predefinedFormId || !dataLc.value?.id) {
        predefinedForms.value = await getPredefinedFormsForSelectService.run();

        if (dataLc.value?.id) {
          dataLc.value = await getSectionCustomFormByIdService.run(dataLc.value.id);
          dataLc.value.isPredefined = !!dataLc.value.fields?.length;

          fields.value = dataLc.value.fields as any[];
          fields.value.forEach((field) => {
            field.showField = field.showField === 1;
            field.institutionRequired = field.institutionRequired === 1;
          });
        }
      }

      loading.value = false;
    });

    watch(
      () => form.predefinedFormId,
      async (value) => {
        if (value) {
          await getFieldsPredefinedForm(value);
        }
      }
    );

    const getFieldsPredefinedForm = async (predefinedFormId: number) => {
      loadingFields.value = true;
      try {
        const response = await getFieldsPredefinedFormService.run(predefinedFormId);

        response.forEach((field) => {
          field.showField = true;
          field.institutionRequired = true;
        });

        fields.value = response;
      } catch (e) {
        console.log('err', e);
      }
      loadingFields.value = false;
    };

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return false;

      try {
        await createOrUpdateSectionCustomFormService.run(
          {
            ...form,
            order: dataLc.value?.order,
            surveyId: parseInt(surveyId as string),
            fields: fields.value.map((field) => ({
              id: field.id,
              typeFieldId: field.typeFieldId,
              typeDataId: field.typeDataId,
              order: field.order,
              isRequired: field.isRequired,
              defaultLabel: field.defaultLabel,
              institutionRequired: field.institutionRequired,
              showField: field.showField,
              label: field.label,
            })),
          },
          dataLc.value?.id
        );

        emit('close');
      } catch (e) {
        console.log('err', e);
      }
    };

    return {
      title,
      v$,
      loading,
      loadingFields,
      predefinedForms,
      fields,
      dataLc,
      save,
    };
  },
});
</script>

<style scoped>
.help-text {
  font-size: 0.7rem;
}
</style>
