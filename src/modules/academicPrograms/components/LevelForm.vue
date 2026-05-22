<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" :label="'academicPrograms.levels.form.name'">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.abbreviation" :label="'Código'">
          <input class="form-control" type="text" id="abbreviation" v-model="v$.form.abbreviation.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.file" :label="'Imagen'">
          <AppUploadImage input-id="file" v-model="v$.form.file.$model" :current-thumbnail="currentThumbnail"></AppUploadImage>
        </AppFormField>
        <h5 class="under__line">Tipo de calificación</h5>
        <div class="d-flex gap-1">
          <AppFormField :form-control="v$.form.isQualitativeGrading">
            <div class="form-check form-switch d-flex gap-1">
              <!-- Checkbox para Cualitativa: se muestra activa si isQualitativeGrading es false -->
              <input class="form-check-input" type="checkbox" id="qualitative" :checked="v$.form.isQualitativeGrading.$model" @click="onQualitativeChange" />
              <div>Cualitativa</div>
            </div>
          </AppFormField>
          <AppFormField :form-control="v$.form.isQualitativeGrading">
            <div class="form-check form-switch d-flex gap-1">
              <!-- Checkbox para Cuantitativa: se muestra activa si isQualitativeGrading es true -->
              <input class="form-check-input" type="checkbox" id="quantitative" @click="onQuantitativeChange" :checked="!v$.form.isQualitativeGrading.$model" />
              <div>Cuantitativa</div>
            </div>
          </AppFormField>
        </div>

        <h5 class="under__line">Configuración sistemas de calificación</h5>

        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th>Mostrar en menú</th>
              <th>Usar porcentajes</th>
              <th>Mostrar en boletín</th>
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
              <td>Indicador de desempeño</td>
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
              <td>Clasificación de actividades</td>
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
        <div class="form-check form-switch" v-if="showUsePercentLearningOutcomesWithActivityCategories">
          <input class="form-check-input" type="checkbox" id="usePercLearOutcWithActiCate" v-model="v$.form.usePercentLearningOutcomesWithActivityCategories.$model" />
          <label class="form-check-label" for="usePercLearOutcWithActiCate"> Calcular la nota de los indicadores con base en las categorías de las actividades </label>
        </div>
        <template v-if="selectedInstitution?.enableAutoSessionConfig">
          <h5 class="under__line">Sesiones automáticas</h5>
          <div class="d-flex gap-1">
            <AppFormField :form-control="v$.form.activateAutomaticSessions">
              <div class="form-check form-switch d-flex gap-1">
                <input type="checkbox" class="form-check-input" v-model="v$.form.activateAutomaticSessions.$model" id="activateAutomaticSessions" />
                <label for="activateAutomaticSessions" class="form-check-label">Activar sesiones automáticas</label>
              </div>
            </AppFormField>
          </div>
        </template>
        <h5 class="under__line">Calificación de comportamiento automático</h5>
        <div class="d-flex gap-1">
          <AppFormField :form-control="v$.form.automaticDisciplineNote">
            <div class="form-check form-switch d-flex gap-1">
              <input type="checkbox" class="form-check-input" v-model="v$.form.automaticDisciplineNote.$model" id="automaticDisciplineNote" />
              <label for="automaticDisciplineNote" class="form-check-label">Activar calificación</label>
            </div>
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, defaultImage } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, watch, computed, onMounted, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';

import { CreateOrUpdateLevelService } from '../services/createOrUpdateLevel.service';

const createOrUpdateLevelService = new CreateOrUpdateLevelService();

export default defineComponent({
  name: 'LevelForm',
  components: { AppUploadImage, AppFormField, AppFormModal, AppButton },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    const data = props.data ?? {};
    const currentThumbnail = data.props?.thumbnail;
    const levelTranslation = 'core.generalTerms.academic.level.singular';
    const title = data.props?.id ? `core.edit ${levelTranslation}` : `core.new ${levelTranslation}`;
    const selectedInstitution = ref();
    const form = reactive({
      name: data?.name ?? null,
      abbreviation: data?.abbreviation ?? null,
      file: null,

      useCompetencies: data?.useCompetencies == 1 ? true : false,
      isQualitativeGrading: data?.isQualitativeGrading == 1 ? true : false,
      percentageCompetencies: data?.percentageCompetencies == 1 ? true : false,
      useCompetenciesInReports: data?.useCompetenciesInReports == 1 ? true : false,
      useLearningOutcomes: data?.useLearningOutcomes == 1 ? true : false,
      percentageLearningOutcomes: data?.percentageLearningOutcomes == 1 ? true : false,
      showLearningOutcomesInReports: data?.showLearningOutcomesInReports == 1 ? true : false,
      useTopics: data?.useTopics == 1 ? true : false,
      useActivityCategories: data?.useActivityCategories == 1 ? true : false,
      percentageActivityCategories: data?.percentageActivityCategories == 1 ? true : false,
      showActivityCategoriesInReports: data?.showActivityCategoriesInReports == 1 ? true : false,
      usePercentLearningOutcomesWithActivityCategories: data?.usePercentLearningOutcomesWithActivityCategories == 1 ? true : false,
      activateAutomaticSessions: data?.activateAutomaticSessions == 1 ? true : false,
      automaticDisciplineNote: data?.automaticDisciplineNote == 1 ? true : false,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          abbreviation: { required },
          file: { defaultImage },
          isQualitativeGrading: {},
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
          usePercentLearningOutcomesWithActivityCategories: {},
          activateAutomaticSessions: {},
          automaticDisciplineNote: {},
        },
      },
      { form }
    );
    // Método para activar cualitativa (isQualitativeGrading = false)
    const onQualitativeChange = () => {
      form.isQualitativeGrading = true;
    };

    // Método para activar cuantitativa (isQualitativeGrading = true)
    const onQuantitativeChange = () => {
      form.isQualitativeGrading = false;
    };
    const showUsePercentLearningOutcomesWithActivityCategories = computed(() => {
      let value = false;

      if (form.percentageLearningOutcomes && form.percentageActivityCategories) value = true;

      return value;
    });

    onMounted(() => {
      const institutionId = Number(localStorage.getItem('institutionId') || '');
      const institutions = JSON.parse(localStorage.getItem('institutions') || '[]');
      selectedInstitution.value = institutions.find((inst: any) => inst.id === institutionId) || null;
    });

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
        if (value) form.percentageCompetencies = false;
        else form.usePercentLearningOutcomesWithActivityCategories = false;
      }
    );
    watch(
      () => form.percentageLearningOutcomes,
      async (value) => {
        if (!value) form.usePercentLearningOutcomesWithActivityCategories = false;
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
        await createOrUpdateLevelService.run(form, data?.id);

        emit('close');
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      currentThumbnail,
      showUsePercentLearningOutcomesWithActivityCategories,
      onQualitativeChange,
      onQuantitativeChange,
      title,
      save,
      v$,
      selectedInstitution,
    };
  },
});
</script>

<style scoped>
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}

.under__line::first-letter {
  text-transform: uppercase;
}
</style>
