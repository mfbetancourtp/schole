<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" :label="'academicPrograms.levels.form.name'">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.abbreviation" :label="'academicPrograms.levels.form.abbreviation'">
          <input class="form-control" type="text" id="abbreviation" v-model="v$.form.abbreviation.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.file" :label="'Imagen'">
          <AppUploadImage input-id="file" v-model="v$.form.file.$model" :current-thumbnail="data.currentThumbnail"></AppUploadImage>
        </AppFormField>

        <hr />

        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th>Mostrar en menú?</th>
              <th>Usar porcentajes?</th>
              <th>Mostrar en boletín?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Competencias</td>
              <td>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="useCompetencies" v-model="v$.form.useCompetencies.$model" />
                </div>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input :disabled="!v$.form.useCompetencies.$model" class="form-check-input" type="checkbox" v-model="v$.form.percentageCompetencies.$model" />
                </div>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input :disabled="!v$.form.useCompetencies.$model" class="form-check-input" type="checkbox" v-model="v$.form.useCompetenciesInReports.$model" />
                </div>
              </td>
            </tr>
            <tr>
              <td>Indicador de Logro</td>
              <td>
                <div class="form-check form-switch">
                  <input :disabled="true" class="form-check-input" type="checkbox" v-model="v$.form.useLearningOutcomes.$model" />
                </div>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input
                    :disabled="!v$.form.useCompetencies.$model || !v$.form.useLearningOutcomes.$model"
                    class="form-check-input"
                    type="checkbox"
                    v-model="v$.form.percentageLearningOutcomes.$model"
                  />
                </div>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input
                    :disabled="!v$.form.useCompetencies.$model || !v$.form.useLearningOutcomes.$model"
                    class="form-check-input"
                    type="checkbox"
                    v-model="v$.form.showLearningOutcomesInReports.$model"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>Temas</td>
              <td>
                <div class="form-check form-switch">
                  <input :disabled="!v$.form.useCompetencies.$model" class="form-check-input" type="checkbox" v-model="v$.form.useTopics.$model" />
                </div>
              </td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Clasificación de Actividades</td>
              <td>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" v-model="v$.form.useActivityCategories.$model" />
                </div>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input :disabled="!v$.form.useActivityCategories.$model" class="form-check-input" type="checkbox" v-model="v$.form.percentageActivityCategories.$model" />
                </div>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input :disabled="!v$.form.useActivityCategories.$model" class="form-check-input" type="checkbox" v-model="v$.form.showActivityCategoriesInReports.$model" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { maxLength, required, defaultImage } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';

import { CreateOrUpdateLevelService } from '../services/createOrUpdateLevel.service';

const createOrUpdateLevelService = new CreateOrUpdateLevelService();

export default defineComponent({
  name: 'ProgramForm',
  components: { AppUploadImage, AppFormField, AppFormModal, AppButton },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    const levelTranslation = 'core.generalTerms.academic.level.singular';
    const title = props.data?.id ? `core.edit ${levelTranslation}` : `core.new ${levelTranslation}`;

    const form = reactive({
      educationLevelId: props.data?.educationLevelId,
      educationSublevelId: props.data?.educationSublevelId,
      codeSnies: props.data?.codeSnies,
      name: props.data?.name ?? null,
      modality: props.data?.modality,
      code: props.data?.code,
      titleGiven: props.data?.titleGiven,

      abbreviation: props.data?.abbreviation ?? null,
      file: null,

      useCompetencies: props.data?.useCompetencies == 1 ? true : false,
      percentageCompetencies: props.data?.percentageCompetencies == 1 ? true : false,
      useCompetenciesInReports: props.data?.useCompetenciesInReports == 1 ? true : false,
      useLearningOutcomes: props.data?.useLearningOutcomes == 1 ? true : false,
      percentageLearningOutcomes: props.data?.percentageLearningOutcomes == 1 ? true : false,
      showLearningOutcomesInReports: props.data?.showLearningOutcomesInReports == 1 ? true : false,
      useTopics: props.data?.useTopics == 1 ? true : false,
      useActivityCategories: props.data?.useActivityCategories == 1 ? true : false,
      percentageActivityCategories: props.data?.percentageActivityCategories == 1 ? true : false,
      showActivityCategoriesInReports: props.data?.showActivityCategoriesInReports == 1 ? true : false,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          abbreviation: { maxLength: maxLength(10) },
          file: { defaultImage },
          useCompetencies: {},
          percentageCompetencies: {},
          useCompetenciesInReports: {},
          useLearningOutcomes: {},
          percentageLearningOutcomes: {},
          showLearningOutcomesInReports: {},
          useTopics: {},
          useActivityCategories: {},
          percentageActivityCategories: {},
          showActivityCategoriesInReports: {},
        },
      },
      { form }
    );

    watch(
      () => form.percentageCompetencies,
      async (value) => {
        if (value) {
          form.percentageActivityCategories = false;
        }
      }
    );
    watch(
      () => form.percentageActivityCategories,
      async (value) => {
        if (value) {
          form.percentageCompetencies = false;
        }
      }
    );
    watch(
      () => form.useCompetencies,
      async (value) => {
        form.useLearningOutcomes = value;
      }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        createOrUpdateLevelService.isFormData = form.file ? true : false;
        await createOrUpdateLevelService.run(form, props.data?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
