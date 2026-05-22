<template>
  <form @submit.prevent="save">
    <AppLoading v-if="loadingFilters"></AppLoading>
    <AppBaseList :title="title" :routes="routes" v-else>
      <template v-slot:content>
        <div  >
          <label><b>Configuración de notas</b></label>
          <div class="form-row">
            <AppFormField :form-control="v$.form.maxQuality" :label="'Nota Máxima'">
              <input class="form-control" type="text" id="maxQuality" v-model="v$.form.maxQuality.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.approvedQuality" :label="'Aprueba a partir de'">
              <input class="form-control" type="text" id="approvedQuality" v-model="v$.form.approvedQuality.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.minQualityForRetrieval" :label="'Recupera si'">
              <input class="form-control" type="text" id="minQualityForRetrieval" v-model="v$.form.minQualityForRetrieval.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.retrievalQuality" :label="'Recupera con'">
              <input class="form-control" type="text" id="retrievalQuality" v-model="v$.form.retrievalQuality.$model" />
            </AppFormField>
          </div>
          <hr />
          <label><b>Configuración por defecto para las asignatiras</b></label>
          <div class="form-row">
            <AppFormField :form-control="v$.form.usePeriods">
              <div class="form-check form-switch">
                <label>Usar notas por periodo</label>
                <input class="form-check-input" type="checkbox" role="switch" v-model="v$.form.usePeriods.$model" />
              </div>
            </AppFormField>
            <AppFormField :form-control="v$.form.useClassroom">
              <div class="form-check form-switch">
                <label>Usar notas por actividad</label>
                <input class="form-check-input" type="checkbox" role="switch" v-model="v$.form.useClassroom.$model" />
              </div>
            </AppFormField>
            <AppFormField :form-control="v$.form.useLMS">
              <div class="form-check form-switch">
                <label>Extraer notas desde un LMS</label>
                <input class="form-check-input" type="checkbox" role="switch" v-model="v$.form.useLMS.$model" />
              </div>
            </AppFormField>
          </div>
          <hr />
          <label><b>Otros complementos de las asignaturas</b></label>
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
        </div>
      </template>
      <template v-slot:actions>
        <AppButtonBack :to="{ name: 'academicPrograms.programView' }"></AppButtonBack>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppBaseList>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../../shared/components/Buttons/AppButtonBack.vue';
import AppBaseList from '../../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';

import { LevelPage3 } from '../../dtos/programs/levelsPage3.dto';

import { GetLevelForEditService } from '../../services/programs/getLevelForEdit.service';
import { UpdateLevelService } from '../../services/programs/updateLevels.service';

const getLevelForEditService = new GetLevelForEditService();
const updateLevelService = new UpdateLevelService();

export default defineComponent({
  name: 'ProgramsForm2',
  components: {
    AppFormField,
    AppButton,
    AppLoading,
    AppBaseList,
    AppButtonBack,
  },

  props: ['data'],

  setup(props) {
    const loadingFilters = ref(true);
    const title = 'Crear / Editar Programas';
    const routes = [{ name: title }];

    const levelList = ref<LevelPage3[]>([]);
    const dataPrograms = ref<any>();

    const currentLevel = ref();
    const route = useRoute();
    const router = useRouter();

    const form = reactive({
      maxQuality: props.data?.maxQuality,
      approvedQuality: props.data?.approvedQuality,
      minQualityForRetrieval: props.data?.minQualityForRetrieval,
      retrievalQuality: props.data?.retrievalQuality,

      usePeriods: props.data?.defaultUsePeriods == 1 ? true : false,
      useClassroom: props.data?.defaultUseClassroom == 1 ? true : false,
      useLMS: props.data?.defaultUseLMS == 1 ? true : false,

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
          name: {},
          educationLevelId: {},
          educationSublevelId: {},

          maxQuality: {},
          approvedQuality: {},
          minQualityForRetrieval: {},
          retrievalQuality: {},

          usePeriods: {},
          useClassroom: {},
          useLMS: {},

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

    onMounted(async () => {
      try {
        currentLevel.value = parseInt(route.params.levelId.toString());
        dataPrograms.value = await getLevelForEditService.run(currentLevel.value);
        console.log('Current Level: ', currentLevel.value);
        levelList.value = dataPrograms.value;
        console.log('Programas: ', levelList.value);
        console.log('default classroom: ', form);

        form.maxQuality = dataPrograms.value.maxQuality;
        form.approvedQuality = dataPrograms.value.approvedQuality;
        form.minQualityForRetrieval = dataPrograms.value.minQualityForRetrieval;
        form.retrievalQuality = dataPrograms.value.retrievalQuality;

        form.usePeriods = dataPrograms.value.defaultUsePeriods === 1 ? true : false;
        form.useClassroom = dataPrograms.value.defaultUseClassroom === 1 ? true : false;
        form.useLMS = dataPrograms.value.defaultUseLMS === 1 ? true : false;

        form.useCompetencies = dataPrograms.value.useCompetencies === 1 ? true : false;
        form.percentageCompetencies = dataPrograms.value.percentageCompetencies === 1 ? true : false;
        form.useCompetenciesInReports = dataPrograms.value.useCompetenciesInReports === 1 ? true : false;
        form.useLearningOutcomes = dataPrograms.value.useLearningOutcomes === 1 ? true : false;
        form.percentageLearningOutcomes = dataPrograms.value.percentageLearningOutcomes === 1 ? true : false;
        form.showLearningOutcomesInReports = dataPrograms.value.showLearningOutcomesInReports === 1 ? true : false;
        form.useTopics = dataPrograms.value.useTopics === 1 ? true : false;
        form.useActivityCategories = dataPrograms.value.useActivityCategories === 1 ? true : false;
        form.percentageActivityCategories = dataPrograms.value.percentageActivityCategories === 1 ? true : false;
        form.showActivityCategoriesInReports = dataPrograms.value.showActivityCategoriesInReports === 1 ? true : false;
      } catch (e) {
        console.log('This error: ', e);
      }
      loadingFilters.value = false;
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
        const dataSend = {
          name: dataPrograms.value.name,
          educationLevelId: dataPrograms.value.educationLevelId,
          educationSublevelId: dataPrograms.value.educationSublevelId,

          maxQuality: form.maxQuality,
          approvedQuality: form.approvedQuality,
          minQualityForRetrieval: form.minQualityForRetrieval,
          retrievalQuality: form.retrievalQuality,

          defaultusePeriods: form.usePeriods,
          defaultuseClassroom: form.useClassroom,
          defaultuseLMS: form.useLMS,

          useCompetencies: form.useCompetencies,
          percentageCompetencies: form.percentageCompetencies,
          useCompetenciesInReports: form.useCompetenciesInReports,
          useLearningOutcomes: form.useLearningOutcomes,
          percentageLearningOutcomes: form.percentageLearningOutcomes,
          showLearningOutcomesInReports: form.showLearningOutcomesInReports,
          useTopics: form.useTopics,
          useActivityCategories: form.useActivityCategories,
          percentageActivityCategories: form.percentageActivityCategories,
          showActivityCategoriesInReports: form.showActivityCategoriesInReports,
        };
        await updateLevelService.run(dataSend, currentLevel.value);
        await router.push({
          name: 'academicPrograms.programView',
        });
      } catch (e) {
        console.log('This init component', e);
      }
    };

    return {
      loadingFilters,
      routes,
      title,
      levelList,
      v$,
      save,
    };
  },
});
</script>
