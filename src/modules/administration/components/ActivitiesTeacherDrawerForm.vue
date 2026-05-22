z
<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility">
    <template #head>
      <span class="title-form">{{ t(title) }} </span>
    </template>
    <template #body>
      <AppLoading v-if="loading || loadingP"></AppLoading>
      <template v-else>
        <div class="section-form" style="position: sticky; top: 0; z-index: 2">
          <div class="section-content">
            <button :class="{ selected: activeSection === 'general' }" @click="setActive('general')">Información General</button>
            <button :class="{ selected: activeSection === 'competencias' }" @click="setActive('competencias')">Competencias e Indicadores</button>
          </div>
        </div>
        <div class="content-form">
          <div v-if="activeSection === 'general'" class="form-section">
            <AppFormField :form-control="v$.form.name" :label="'classroom.activitiesTeacher.form.name'">
              <input
                v-model="v$.form.name.$model"
                class="form-control"
                type="text"
                id="name"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>

            <AppFormField :form-control="v$.form.dateSince" :label="'classroom.activitiesTeacher.form.dateSince'">
              <input v-model="v$.form.dateSince.$model" type="datetime-local" class="form-control" id="dateSince" />
            </AppFormField>

            <AppFormField :form-control="v$.form.dateUntil" :label="'classroom.activitiesTeacher.form.dateUntil'">
              <input v-model="v$.form.dateUntil.$model" type="datetime-local" class="form-control" id="dateUntil" />
            </AppFormField>

            <AppFormField :form-control="v$.form.description" :label="'classroom.activitiesTeacher.form.description'">
              <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control" :cols="40" :rows="3" id="description"></AppVoiceInput>
            </AppFormField>

            <!-- <AppFormField :form-control="v$.form.deliveryMaxNumberFiles" :label="'classroom.activitiesTeacher.form.deliveryMaxNumberFiles'">
              <input v-model="v$.form.deliveryMaxNumberFiles.$model" class="form-control" type="number" id="deliveryMaxNumberFiles" />
            </AppFormField> -->

            <AppFormField :form-control="v$.form.file" :label="'classroom.activitiesTeacher.form.attachmentUrl'">
              <AppUploadImage v-model="v$.form.file.$model" :current-thumbnail="activity?.attachmentUrl" input-id="file"></AppUploadImage>
            </AppFormField>
          </div>

          <div v-if="activeSection === 'competencias'" class="form-section">
            <AppFormField :form-control="v$.form.periodId" :label="'academicPlanning.periods.singular'">
              <AppAutocomplete :options="periods" v-model="v$.form.periodId.$model" :input-id="'periodId'"> </AppAutocomplete>
            </AppFormField>
            <AppFormField :form-control="v$.form.rowOrder" :label="'Competencias evaluadas'">
              <AppAutocomplete v-model="v$.form.rowOrder.$model" :options="competencies" label="description"> </AppAutocomplete>
            </AppFormField>

            <AppFormField v-if="level?.useCompetencies" :form-control="v$.form.learningOutcomesIds" :label="'Niveles de desempeño evaluados'">
              <AppAutocomplete
                :options="learningOutcomes"
                :label="'description'"
                :multiple="!!!level.usePercentLearningOutcomesWithActivityCategories && !level.percentageLearningOutcomes"
                v-model="v$.form.learningOutcomesIds.$model"
                :input-id="'learningOutcomesIds'"
              ></AppAutocomplete>
            </AppFormField>

            <AppFormField v-if="level?.useTopics" :form-control="v$.form.topicIds" :label="'Temas evaluados'">
              <template v-if="v$.form.topicIds.$model">
                <AppAutocomplete :options="topics" v-model="v$.form.topicIds.$model" :label="'name'" :multiple="true"> </AppAutocomplete>
              </template>
              <template v-else>
                <AppAutocomplete :options="topics" v-model="v$.form.topicIds.$model" :multiple="true"></AppAutocomplete>
              </template>
            </AppFormField>

            <div class="form-row">
              <AppFormField v-if="level?.useActivityCategories" :form-control="v$.form.activityCategoryId">
                <div class="d-flex align-items-end justify-content-between mb-1">
                  <div class="d-flex align-items-end gap-1">
                    <label for="startNumberDay">{{ t('classroom.activitiesTeacher.form.activityCategory') }}</label>

                    <div v-if="categoriesByPeriod" v-tooltip="'Categorías por periodo'">
                      <AppIcon icon="info-circle" />
                    </div>

                    <div v-else v-tooltip="'Categorías por ciclo académico'">
                      <AppIcon icon="info-circle" />
                    </div>
                  </div>

                  <div class="d-flex justify-content-center gap-2">
                    <span
                      class="customized-badge"
                      :class="{
                        'outlined-badge': categoriesByPeriod == 0 || categoriesByPeriod == null,
                      }"
                      @click="categoriesByPeriod = 1"
                      >Periodo</span
                    >
                    <span
                      class="customized-badge"
                      :class="{
                        'outlined-badge': categoriesByPeriod == 1 || categoriesByPeriod == null,
                      }"
                      @click="categoriesByPeriod = 0"
                      >Ciclo Académico</span
                    >
                  </div>
                </div>
                <template v-if="loadingCategories">
                  <AppAutocomplete :options="[]" :disabled="true" :input-id="'activityCategoryId'"></AppAutocomplete>
                </template>
                <template v-else>
                  <AppAutocomplete :options="activityCategories" v-model="v$.form.activityCategoryId.$model" :input-id="'activityCategoryId'"></AppAutocomplete>
                </template>
              </AppFormField>
            </div>
          </div>
        </div>
      </template>
    </template>
    <template #footer>
      <div class="buttons-form">
        <div v-if="activeSection === 'general'">
          <AppButton @click="nextSection">Siguiente</AppButton>
        </div>
        <div v-if="activeSection === 'competencias'">
          <AppButton @click="save()" label="core.save"></AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
//import { defineComponent, ref } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
//import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { LevelDto } from '../dtos/level.dto';
import { ActivityDetailDto } from '../dtos/activity.dto';

import { CreateOrUpdateActivityService } from '../services/createOrUpdateActivity.service';
import { GetActivitiesRelatedDataFormService } from '../services/getActivitiesRelatedDataForm.service';
import { GetCompetenciesWithLearningOutcomesService } from '../services/getCompetenciesWithLearningOutcomes.service';
import { GetLearningOutcomesByCompetencyService } from '../services/getLearningOutcomesByCompetency.service';
import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';
//import { useHeaderStore } from '../../../stores/header.store';
import { GetTopicsByCompetencyService } from '../services/getTopicsByCompetency.service';
import { GetActivityCategoriesForParamsService } from '../services/getActivityCategoriesForParams.service';

const getActivitiesRelatedDataFormService = new GetActivitiesRelatedDataFormService();
const createOrUpdateActivityService = new CreateOrUpdateActivityService();
const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getCompetenciesWithLearningOutcomesService = new GetCompetenciesWithLearningOutcomesService();
const getLearningOutComesByCompetences = new GetLearningOutcomesByCompetencyService();
const getTopicsByCompetencyService = new GetTopicsByCompetencyService();
const getActivityCategoriesForParams = new GetActivityCategoriesForParamsService();

export default defineComponent({
  name: 'ActivitiesTeacherDrawerForm',
  components: {
    AppDrawer,
    AppAutocomplete,
    AppUploadImage,
    AppFormField,
    AppLoading,
    AppButton,
    AppVoiceInput,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    routes: {
      type: Array as PropType<BreadCrumbsType[]>,
      required: false,
    },
    competenciesByPeriod: {
      type: Array as PropType<any[]>,
      required: true,
    },
    activity: {
      type: Object as PropType<ActivityDetailDto | null>,
    },
    level: {
      type: Object as PropType<any>,
      required: true,
    },
    loadingP: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:isVisible', 'reload-data'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    //const router = useRouter();
    let data = props.activity ?? null;
    const courseId = parseInt(route.params.courseId.toString(), 10);

    let currentContentAttachmentUrl = data ? data.attachmentUrl : null;
    dayjs.extend(isSameOrAfter);
    dayjs.extend(isSameOrBefore);
    const activityCategories: Ref<any[]> = ref([]);
    const level: Ref<LevelDto | null> = ref(null);
    const learningOutcomes: Ref<any[]> = ref([]);
    const competencies: Ref<any[]> = ref([]);
    const periods: Ref<any[]> = ref([]);
    const topics: Ref<any[]> = ref([]);

    const competencieId = ref();

    const categoriesByPeriod = ref<any>(null);
    const subtitle = ref();
    const loading = ref(true);
    const loadingCategories = ref(false);
    const isOnMounted = ref(true);

    const file: { value: any } = reactive({ value: null });

    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value); // Emitimos el evento para v-model
      activeSection.value = 'general';
    };
    const activeSection = ref('general');
    const sections = ['general', 'competencias'];

    const setActive = (section: string) => {
      activeSection.value = section;
    };
    const nextSection = () => {
      const currentIndex = sections.indexOf(activeSection.value);
      const nextIndex = (currentIndex + 1) % sections.length;
      activeSection.value = sections[nextIndex];
    };

    const form: any = reactive({
      planningWeekId: parseInt(route.query.planningWeekId as string, 10) ?? data?.planningWeekId ?? null,
      name: data?.name ?? null,
      dateSince: data?.dateSince ?? dayjs().format('YYYY-MM-DDTHH:mm'),
      dateUntil: data?.dateUntil ?? dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),

      description: data?.description ?? null,

      periodId: data?.periodId ?? null,
      learningOutcomesIds:
        !props.level?.usePercentLearningOutcomesWithActivityCategories && !props.level?.percentageLearningOutcomes
          ? data?.learningOutcomesIds
          : Array.isArray(data?.learningOutcomesIds)
          ? data?.learningOutcomesIds[0]
          : data?.learningOutcomesIds,
      topicIds: data?.topicIds || [],

      activityCategoryId: data?.activityCategoryId ?? null,
      rowOrder: data?.rowOrder ?? null,
      attachmentUrl: null,
      file: null,
      deliveryMaxNumberFiles: data?.deliveryMaxNumberFiles ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          planningWeekId: {},

          name: { required },
          dateSince: { required },
          dateUntil: { required },

          description: {},

          periodId: {},
          learningOutcomesIds: {},
          topicIds: {},

          activityCategoryId: {},
          rowOrder: {},
          file: {},
          deliveryMaxNumberFiles: {},
        },
      },
      { form }
    );
    const initializeForm = () => {
      if (props.activity) {
        data = props.activity ?? null;
        currentContentAttachmentUrl = data ? data.attachmentUrl : null;
        (form.planningWeekId = parseInt(route.query.planningWeekId as string, 10) ?? data?.planningWeekId ?? null), (form.name = data.name);
        form.dateSince = data.dateSince ?? dayjs().format('YYYY-MM-DDTHH:mm');
        form.dateUntil = data.dateUntil ?? dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm');
        form.description = data.description;
        form.periodId = data.periodId;
        form.activityCategoryId = data.activityCategoryId;
        form.rowOrder = props.activity?.rowOrder;
        form.deliveryMaxNumberFiles = data.deliveryMaxNumberFiles;
      }
    };
    const fetchData = async () => {
      try {
        // Ejecuta múltiples servicios en paralelo
        const [levels, response, outcomes, topicsResult] = await Promise.all([
          getLevelByCourseIdService.run(courseId),
          getActivitiesRelatedDataFormService.run(courseId, data?.id),
          getLearningOutComesByCompetences.run(form.rowOrder),
          getTopicsByCompetencyService.run(form.rowOrder),
        ]);

        level.value = levels;
        periods.value = response.periods.filter((period: any) => period.active === 1);

        await recalcPeriod();
        activityCategories.value = response.activityCategories;
        subtitle.value = response.courseData.name;
        learningOutcomes.value = outcomes;
        topics.value = topicsResult;

        if (form.periodId) {
          await getCompetencies();
        }

        if (data && data?.name) {
          categoriesByPeriod.value = activityCategories.value.some((item) => item.id === data?.activityCategoryId && item.periodId) ? 1 : 0;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        loading.value = false;
        isOnMounted.value = false;
      }
    };

    // Ejecutar al montar el componente
    onMounted(async () => {
      await initializeForm();
      await fetchData();
    });
    const recalcPeriod = () => {
      if (form.dateSince && form.dateUntil && periods.value.length > 0 && !props.activity?.id) {
        const sinceDate = dayjs(form.dateSince).startOf('day');
        const untilDate = dayjs(form.dateUntil).endOf('day');

        const selectedPeriod = periods.value.find((period) => {
          const periodStart = dayjs(period.startDate, 'YYYY-MM-DD').startOf('day');
          const periodEnd = dayjs(period.endDate, 'YYYY-MM-DD').endOf('day');

          return periodStart.isSameOrBefore(sinceDate) && periodEnd.isSameOrAfter(untilDate);
        });

        form.periodId = selectedPeriod ? selectedPeriod.id : null;
      }
    };

    // Actualiza cuando `loadingP` cambie a `false`
    watch(
      () => props.loadingP,
      async (newLoadingState) => {
        if (!newLoadingState) {
          initializeForm();
          await fetchData();
        }
      }
      //{ immediate: true }
    );

    const getCategories = async () => {
      activityCategories.value = [];

      if (form.periodId && categoriesByPeriod.value != null) {
        loadingCategories.value = true;

        const period: any = periods.value.filter((item) => item.id == form.periodId)[0];
        const params: any = { courseId: courseId };

        if (categoriesByPeriod.value == 1) params.periodId = form.periodId;
        else if (categoriesByPeriod.value == 0) params.academicPeriodId = period.academicPeriodId;

        activityCategories.value = await getActivityCategoriesForParams.run(params);

        loadingCategories.value = false;
      }
    };
    watch([() => form.dateSince, () => form.dateUntil], ([newDateSince, newDateUntil]) => {
      if (newDateSince && newDateUntil && periods.value.length > 0 && !props.activity?.id) {
        // Convertimos la fecha del formulario al inicio y final del día
        const sinceDate = dayjs(newDateSince).startOf('day');
        const untilDate = dayjs(newDateUntil).endOf('day');

        // Buscamos un periodo que “envuelva” (contenga) esas fechas
        const selectedPeriod = periods.value.find((period) => {
          // Parseamos las fechas del periodo al inicio y final del día
          const periodStart = dayjs(period.startDate, 'YYYY-MM-DD').startOf('day');
          const periodEnd = dayjs(period.endDate, 'YYYY-MM-DD').endOf('day');

          return periodStart.isSameOrBefore(sinceDate) && periodEnd.isSameOrAfter(untilDate);
        });

        form.periodId = selectedPeriod ? selectedPeriod.id : null;
        form.periodId = props.activity?.periodId ?? selectedPeriod ? selectedPeriod.id : null;
      }
    });

    watch(categoriesByPeriod, async () => {
      await getCategories();
    });
    watch(
      () => form.periodId,
      async (value) => {
        if (value) {
          learningOutcomes.value = [];
          competencies.value = [];
          topics.value = [];

          competencies.value = props.competenciesByPeriod?.filter((item: any) => item.periodId == value)[0]?.competences;
        } else {
          learningOutcomes.value = [];
          competencies.value = [];
          topics.value = [];
        }

        await getCategories();
      }
    );
    watch(
      () => form.periodId,
      async (newPeriodId) => {
        if (newPeriodId) {
          await getCompetencies();
        }
      }
    );

    watch(
      () => form.rowOrder,

      async (newRowOrder, oldRowOrder) => {
        // Si newRowOrder es null, limpiamos form.learningOutcomesIds y salimos

        if (newRowOrder === null) {
          form.learningOutcomesIds = !props.level?.usePercentLearningOutcomesWithActivityCategories ? null : [];
          learningOutcomes.value = [];

          return;
        }

        const selectedCompetency = competencies.value.find((comp) => comp.id === newRowOrder);

        if (selectedCompetency) {
          try {
            const newLearningOutcomes = await getLearningOutComesByCompetences.run(selectedCompetency.id);
            learningOutcomes.value = newLearningOutcomes;
            // Si estamos editando y el nuevo rowOrder es distinto al original, limpiamos el campo
            if (data && newRowOrder !== data.rowOrder) {
              form.learningOutcomesIds = !props.level?.usePercentLearningOutcomesWithActivityCategories && !props.level?.percentageLearningOutcomes ? null : [];
            } else {
              form.learningOutcomesIds =
                !props.level?.usePercentLearningOutcomesWithActivityCategories && !props.level?.percentageLearningOutcomes
                  ? data?.learningOutcomesIds
                  : Array.isArray(data?.learningOutcomesIds)
                  ? data?.learningOutcomesIds[0]
                  : data?.learningOutcomesIds;
            }
          } catch (error) {
            console.error('Error fetching learning outcomes:', error);
          }
        }
      }
    );

    watch(
      () => form.rowOrder,
      async (newRowOrder, oldRowOrder) => {
        // Si newRowOrder es null, limpiamos form.topicIds y salimos
        if (newRowOrder === null) {
          topics.value = [];
          form.topicIds = [];
          return;
        }

        const selectedCompetency = competencies.value.find((comp) => comp.id === newRowOrder);
        if (selectedCompetency) {
          try {
            const newTopics = await getTopicsByCompetencyService.run(selectedCompetency.id);
            topics.value = newTopics;
            // Si estamos editando y el nuevo rowOrder es distinto al original, limpiamos el campo
            if (data && newRowOrder !== data.rowOrder) {
              form.topicIds = [];
            } else {
              form.topicIds = data?.topicIds ? data?.topicIds : [];
            }
          } catch (error) {
            console.error('Error fetching topics:', error);
          }
        }
      }
    );

    const getCompetencies = async () => {
      const params: any = {};

      if (form.periodId) params.periodId = form.periodId;

      competencies.value = await getCompetenciesWithLearningOutcomesService.run(courseId, params);
      const selectedCompetency = competencies.value.find((comp) => comp.id === form.rowOrder);
      if (selectedCompetency) {
        try {
          const newLearningOutcomes = await getLearningOutComesByCompetences.run(selectedCompetency.id);
          learningOutcomes.value = newLearningOutcomes;
          // Si estamos editando y el nuevo rowOrder es distinto al original, limpiamos el campo
          if (data && form.rowOrder !== data.rowOrder) {
            form.learningOutcomesIds = !props.level?.usePercentLearningOutcomesWithActivityCategories && !props.level?.percentageLearningOutcomes ? null : [];
          } else {
            form.learningOutcomesIds =
              !props.level?.usePercentLearningOutcomesWithActivityCategories && !props.level?.percentageLearningOutcomes
                ? data?.learningOutcomesIds
                : Array.isArray(data?.learningOutcomesIds)
                ? data?.learningOutcomesIds[0]
                : data?.learningOutcomesIds;
          }
          const newTopics = await getTopicsByCompetencyService.run(selectedCompetency.id);
          topics.value = newTopics;
          // Si estamos editando y el nuevo rowOrder es distinto al original, limpiamos el campo
          if (data && form.rowOrder !== data.rowOrder) {
            form.topicIds = [];
          } else {
            form.topicIds = data?.topicIds ? data?.topicIds : [];
          }
        } catch (error) {
          console.error('Error fetching learning outcomes:', error);
        }
      }
    };

    const onFileChange = (event: any) => {
      const files = event.target.files;
      if (!files.length) return;

      form.file = files[0];

      file.value = form.file.name;
    };
    const getFile = () => {
      let fileUpload = document.getElementById('fileIn');
      if (fileUpload != null) {
        fileUpload.click();
      }
    };
    /*
    const goBack = () => {
      router.go(-1);
    };*/
    // Método para limpiar el formulario
    const resetForm = () => {
      form.planningWeekId = null;
      form.name = '';
      form.dateSince = dayjs().format('YYYY-MM-DDTHH:mm');
      form.dateUntil = dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm');
      form.description = '';
      form.periodId = null;
      form.learningOutcomesIds = [];
      form.topicIds = [];
      form.activityCategoryId = null;
      form.rowOrder = null;
      form.file = null;
      form.deliveryMaxNumberFiles = null;

      v$.value.$reset();
      activeSection.value = sections[0];
      //activeSection.value = ('general');
    };
    watch(
      () => props.isVisible,
      (newVal) => {
        if (!newVal && data) {
          resetForm(); // Resetea el formulario cuando el drawer se cierra
        }
      }
    );

    const save = async (/*goBack: any*/) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      if (form.description) form.description = form.description.replace(/\n/g, '<br />');

      const dataSend = {
        planningWeekId: form.planningWeekId ?? null,
        courseId: courseId ?? null,
        name: form.name ?? null,
        activityCategoryId: form.activityCategoryId ?? null,
        periodId: form.periodId ?? null,
        description: form.description,
        file: form.file,
        dateSince: dayjs(form.dateSince).format('YYYY-MM-DD HH:mm'),
        dateUntil: dayjs(form.dateUntil).format('YYYY-MM-DD HH:mm'),
        rowOrder: form.rowOrder,
        deliveryMaxNumberFiles: form.deliveryMaxNumberFiles,
        learningOutcomesIds: form.learningOutcomesIds ? (!Array.isArray(form.learningOutcomesIds) ? [form.learningOutcomesIds] : form.learningOutcomesIds) : [],
        topicIds: form.topicIds ? (!Array.isArray(form.topicIds) ? [form.topicIds] : form.topicIds) : [],
      };

      try {
        if (form.file) {
          createOrUpdateActivityService.isFormData = true;
        }
        await createOrUpdateActivityService.run(dataSend, data?.id);

        //goBack = router.go(-1);

        updateVisibility(false);
        resetForm();
        emit('reload-data');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      v$,
      t,

      setActive,
      activeSection,
      nextSection,

      currentContentAttachmentUrl,
      categoriesByPeriod,
      activityCategories,
      learningOutcomes,
      competencieId,
      competencies,
      courseId,
      periods,
      loadingCategories,
      topics,
      file,
      updateVisibility,

      onFileChange,
      getFile,
      save,
      //goBack,

      primaryColor: import.meta.env.VITE_COLOR_PRIMARY,
    };
  },
});
</script>
<style scoped>
.title-form {
  margin-left: auto;
  font-size: 18px;
  letter-spacing: 0.3px;
  font-weight: bold;
  color: #fff;
}
.section-content {
  min-height: 38px;
  background-color: #f4f6f8;
  padding: 10px 8px;
  display: flex;
}

.section-content button {
  padding: 8px 0px;

  /*margin-right: 10px;
  border: 1px solid #ccc;
  background-color: white;*/
  cursor: pointer;
  border-radius: 12px;
  flex: 1 1 0px;
  color: #8d8d8d;
  transition: all 0.55s ease;
  font-size: 0.875rem;
  /*font-weight: bold;*/
  letter-spacing: 0.2px;
  transform: translatey(0);
}

.section-content button.selected {
  background-color: var(--color-primary);
  color: #fff;
  border-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transform: translatey(-2px);
  font-weight: bold;
}
.content-form {
  padding: 20px;
  /* max-height: 76vh;*/
  overflow-y: auto;
}
.customized-badge {
  background-color: var(--color-primary);
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.1rem 0.3rem;
  border-radius: 1rem;
  cursor: pointer;
}

.outlined-badge {
  background-color: inherit;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
</style>
