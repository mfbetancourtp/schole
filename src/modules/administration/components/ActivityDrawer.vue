<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility">
    <template #head>
      <div class="drawer-header">
        <span class="title-form">{{ t(title) }}</span>
      </div>
    </template>
    <template #body>
      <AppLoading v-if="loading || loadingP"></AppLoading>
      <template v-else>
        <div class="section-form">
          <div class="section-tabs">
            <button :class="{ selected: activeSection === 'general' }" @click="setActive('general')">
              <span>Información General</span>
            </button>
            <button :class="{ selected: activeSection === 'competencias' }" @click="setActive('competencias')">
              <span>Competencias y Desempeños</span>
            </button>
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

            <div class="date-fields-container">
              <AppFormField :form-control="v$.form.dateSince" :label="'classroom.activitiesTeacher.form.dateSince'" class="date-field">
                <input v-model="v$.form.dateSince.$model" type="datetime-local" class="form-control form-control-mod" id="dateSince" />
              </AppFormField>

              <AppFormField :form-control="v$.form.dateUntil" :label="'classroom.activitiesTeacher.form.dateUntil'" class="date-field">
                <input v-model="v$.form.dateUntil.$model" type="datetime-local" class="form-control form-control-mod" id="dateUntil" />
              </AppFormField>
            </div>

            <AppFormField :form-control="v$.form.description" :label="'classroom.activitiesTeacher.form.description'">
              <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control" />

            </AppFormField>

            <AppFormField :form-control="v$.form.deliveryMaxNumberFiles" :label="'classroom.activitiesTeacher.form.deliveryMaxNumberFiles'">
              <input v-model="v$.form.deliveryMaxNumberFiles.$model" class="form-control" type="number" id="deliveryMaxNumberFiles" />
            </AppFormField>

            <AppFormField :form-control="v$.form.attachmentUrl" :label="'classroom.activitiesTeacher.form.attachmentUrl'">
              <AppUploadFile v-model="v$.form.attachmentUrl.$model" :current-file="currentContentAttachmentUrl" input-id="attachmentUrl"></AppUploadFile>
            </AppFormField>
          </div>

          <div v-if="activeSection === 'competencias'" class="form-section">
            <AppFormField :form-control="v$.form.periodId" :label="'academicPlanning.periods.singular'">
              <AppAutocomplete :options="periods" v-model="v$.form.periodId.$model" :input-id="'periodId'"> </AppAutocomplete>
            </AppFormField>

            <AppCheckPermission permission="classroom.activitiesTeacher.list">
              <AppFormField :form-control="v$.form.rowOrder" :label="'Competencias evaluadas'">
                <AppAutocomplete v-model="v$.form.rowOrder.$model" :options="competencies" label="description"> </AppAutocomplete>
              </AppFormField>
            </AppCheckPermission>

            <AppCheckPermission permission="classroom.activitiesTeacher.list">
              <AppFormField v-if="level?.useCompetencies" :form-control="v$.form.learningOutcomesIds" :label="'Indicadores de desempeño evaluados'">
                <AppAutocomplete
                  :options="learningOutcomes"
                  :label="'description'"
                  :multiple="!!!level.usePercentLearningOutcomesWithActivityCategories"
                  v-model="v$.form.learningOutcomesIds.$model"
                  :input-id="'learningOutcomesIds'"
                ></AppAutocomplete>
              </AppFormField>
            </AppCheckPermission>

            <AppCheckPermission permission="classroom.activitiesTeacher.list">
              <AppFormField v-if="level?.useTopics" :form-control="v$.form.topicIds" :label="'Temas evaluados'">
                <template v-if="v$.form.topicIds.$model">
                  <AppAutocomplete :options="topics" v-model="v$.form.topicIds.$model" :label="'name'" :multiple="true"> </AppAutocomplete>
                </template>

                <template v-else>
                  <AppAutocomplete :options="topics" v-model="v$.form.topicIds.$model" :multiple="true"></AppAutocomplete>
                </template>
              </AppFormField>
            </AppCheckPermission>

            <AppCheckPermission permission="classroom.activitiesTeacher.list">
              <div class="form-row" v-if="level?.useActivityCategories">
                <AppFormField :form-control="v$.form.activityCategoryId">
                  <div class="category-header">
                    <div class="category-label">
                      <label for="startNumberDay">{{ t('classroom.activitiesTeacher.form.activityCategory') }}</label>

                      <div v-if="categoriesByPeriod" v-tooltip="'Categorías por periodo'" class="info-icon">
                        <AppIcon icon="info-circle" />
                      </div>

                      <div v-else v-tooltip="'Categorías por ciclo académico'" class="info-icon">
                        <AppIcon icon="info-circle" />
                      </div>
                    </div>

                    <div class="toggle-buttons">
                      <button
                        class="toggle-btn"
                        :class="{
                          'toggle-btn-active': categoriesByPeriod === 1,
                        }"
                        @click="categoriesByPeriod = 1"
                      >
                        Periodo
                      </button>
                      <button
                        class="toggle-btn"
                        :class="{
                          'toggle-btn-active': categoriesByPeriod === 0,
                        }"
                        @click="categoriesByPeriod = 0"
                      >
                        Ciclo Académico
                      </button>
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
            </AppCheckPermission>
          </div>
        </div>
      </template>
    </template>
    <template #footer>
      <div class="buttons-form">
        <div v-if="activeSection === 'general'">
          <AppButton @click="nextSection" class="next-button">Siguiente</AppButton>
        </div>
        <div v-if="activeSection === 'competencias'">
          <AppButton @click="save()" label="core.save" class="save-button"></AppButton>
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

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

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
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getActivitiesRelatedDataFormService = new GetActivitiesRelatedDataFormService();
const createOrUpdateActivityService = new CreateOrUpdateActivityService();
const getLevelByCourseIdService = new GetLevelByCourseIdService();
const getCompetenciesWithLearningOutcomesService = new GetCompetenciesWithLearningOutcomesService();
const getLearningOutComesByCompetences = new GetLearningOutcomesByCompetencyService();
const getTopicsByCompetencyService = new GetTopicsByCompetencyService();
const getActivityCategoriesForParams = new GetActivityCategoriesForParamsService();

export default defineComponent({
  name: 'ActivityDrawer',
  components: {
    AppCheckPermission,
    AppDrawer,
    AppAutocomplete,
    AppUploadFile,
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
      planningWeekId: props.activity?.planningWeekId ?? null,

      name: data?.name ?? null,
      dateSince: data?.dateSince ?? null,
      dateUntil: data?.dateUntil ?? null,

      description: data?.description ?? null,

      periodId: data?.periodId ?? null,
      learningOutcomesIds: [],
      topicIds: [],

      activityCategoryId: data?.activityCategoryId ?? null,
      rowOrder: data?.rowOrder ?? null,
      attachmentUrl: null,
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
          attachmentUrl: {},
          deliveryMaxNumberFiles: {},
        },
      },
      { form }
    );
    const initializeForm = () => {
      if (props.activity) {
        data = props.activity ?? null;
        currentContentAttachmentUrl = data ? data.attachmentUrl : null;
        (form.planningWeekId = data?.planningWeekId ?? null), (form.name = props.activity.name);
        form.dateSince = props.activity.dateSince;
        form.dateUntil = props.activity.dateUntil;
        form.description = props.activity.description;
        form.periodId = props.activity.periodId;
        form.activityCategoryId = props.activity.activityCategoryId;
        form.rowOrder = props.activity.rowOrder;
        form.deliveryMaxNumberFiles = props.activity.deliveryMaxNumberFiles;
      }
    };
    const fetchData = async () => {
      try {
        // Ejecuta múltiples servicios en paralelo
        const [levels, response, outcomes, topicsResult] = await Promise.all([
          getLevelByCourseIdService.run(courseId),
          getActivitiesRelatedDataFormService.run(courseId, props.activity?.id),
          getLearningOutComesByCompetences.run(form.rowOrder),
          getTopicsByCompetencyService.run(form.rowOrder),
        ]);

        level.value = levels;
        periods.value = response.periods;
        activityCategories.value = response.activityCategories;
        subtitle.value = response.courseData.name;
        learningOutcomes.value = outcomes;
        topics.value = topicsResult;

        form.learningOutcomesIds = await response.learningOutcomes.filter((elemt: any) => elemt.checked).map((elemt: any) => elemt.id);

        form.topicIds = props.activity?.topicIds || [];

        if (form.periodId) {
          await getCompetencies();
        }

        if (props.activity && props.activity.name) {
          categoriesByPeriod.value = activityCategories.value.some((item) => item.id === props.activity?.activityCategoryId && item.periodId) ? 1 : 0;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        loading.value = false;
        isOnMounted.value = false;
      }
    };

    // Ejecutar al montar el componente
    onMounted(() => {
      initializeForm();
      fetchData();
    });

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

          competencies.value = props.competenciesByPeriod.filter((item: any) => item.periodId == value)[0].competences;
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
      async (newRowOrder) => {
        if (newRowOrder) {
          const selectedCompetency = competencies.value.find((comp) => comp.id === newRowOrder);

          if (selectedCompetency) {
            try {
              const newLearningOutcomes = await getLearningOutComesByCompetences.run(selectedCompetency.id);
              learningOutcomes.value = newLearningOutcomes;
              form.learningOutcomesIds = [];
            } catch (error) {
              console.error('Error fetching learning outcomes:', error);
            }
          }
        }
      }
    );
    watch(
      () => form.rowOrder,
      async (newRowOrder) => {
        if (newRowOrder) {
          const selectedCompetency = competencies.value.find((comp) => comp.id === newRowOrder);

          if (selectedCompetency) {
            try {
              const newTopics = await getTopicsByCompetencyService.run(selectedCompetency.id);
              topics.value = newTopics;
              form.topicIds = [];
            } catch (error) {
              console.error('Error fetching topics:', error);
            }
          }
        }
      }
    );

    const getCompetencies = async () => {
      const params: any = {};

      if (form.periodId) params.periodId = form.periodId;

      competencies.value = await getCompetenciesWithLearningOutcomesService.run(courseId, params);
      if (form.competencyId) {
        const selectedCompetency = competencies.value.find((comp) => comp.id === form.competencyId);
        if (selectedCompetency) {
          learningOutcomes.value = selectedCompetency.learningOutcomes;
        }
      }
    };

    const onFileChange = (event: any) => {
      const files = event.target.files;
      if (!files.length) return;

      form.attachmentUrl = files[0];

      file.value = form.attachmentUrl.name;
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
      form.dateSince = null;
      form.dateUntil = null;
      form.description = '';
      form.periodId = null;
      form.learningOutcomesIds = [];
      form.topicIds = [];
      form.activityCategoryId = null;
      form.rowOrder = null;
      form.attachmentUrl = null;
      form.deliveryMaxNumberFiles = null;

      v$.value.$reset();
      activeSection.value = sections[0];
      //activeSection.value = ('general');
    };
    watch(
      () => props.isVisible,
      (newVal) => {
        if (!newVal && props.activity) {
          resetForm(); // Resetea el formulario cuando el drawer se cierra
        }
      }
    );

    const save = async (/*goBack: any*/) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      if (form.description) form.description = form.description.replace(/\n/g, '<br />');

      const pwId = localStorage.getItem('planningWeekId');

      const dataSend = {
        planningWeekId: Number(pwId),
        courseId: courseId,
        name: form.name,
        activityCategoryId: form.activityCategoryId,
        periodId: form.periodId,
        description: form.description,
        attachmentUrl: form.attachmentUrl,
        dateSince: dayjs(form.dateSince).format('YYYY-MM-DD HH:mm'),
        dateUntil: dayjs(form.dateUntil).format('YYYY-MM-DD HH:mm'),
        rowOrder: form.rowOrder,
        deliveryMaxNumberFiles: form.deliveryMaxNumberFiles,
        learningOutcomesIds: form.learningOutcomesIds ? (!Array.isArray(form.learningOutcomesIds) ? [form.learningOutcomesIds] : form.learningOutcomesIds) : null,
        topicIds: form.topicIds ? (!Array.isArray(form.topicIds) ? [form.topicIds] : form.topicIds) : null,
      };

      try {
        if (form.attachmentUrl) {
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
/* Estilos generales */
:root {
  --drawer-width: 480px;
  --primary-color: v-bind('primaryColor');
  --border-radius: 8px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition-normal: all 0.3s ease;
}

/* Cabecera del drawer */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.title-form {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--color-light);
  text-align: center;
}

/* Tabs de sección */
.section-form {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-light);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.section-tabs {
  display: flex;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  gap: 12px;
}

.section-tabs button {
  flex: 1;
  padding: 10px 0;
  border: none;
  background-color: transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.section-tabs button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background-color: var(--primary-color);
  transition: var(--transition-normal);
  transform: translateX(-50%);
}

.section-tabs button.selected {
  color: var(--primary-color);
  font-weight: 600;
}

.section-tabs button.selected::after {
  width: 80%;
}

.section-tabs button:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Contenido del formulario */
.content-form {
  padding: 20px 16px;
  max-height: calc(100vh - 180px);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Campos de fecha en línea */
.date-fields-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
}

/* Estilos para textarea */
.textarea-control {
  min-height: 100px;
  resize: vertical;
}

/* Estilos para los botones de toggle */
.category-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.category-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  color: var(--primary-color);
  cursor: help;
}

.toggle-buttons {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.toggle-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-primary);
  background-color: transparent;
  color: var(--color-primary);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-normal);
}

.toggle-btn-active {
  background-color: var(--color-primary);
  color: var(--color-blanco);
}

/* Botones de acción */
.buttons-form {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
}

.next-button,
.save-button {
  min-width: 120px;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.next-button:hover,
.save-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.form-control-mod {
  max-width: 215px;
}

/* Estilos responsivos para drawer de 480px */
@media (max-width: 480px) {
  .date-fields-container {
    grid-template-columns: 1fr;
  }

  .section-tabs {
    padding: 8px 12px;
  }

  .content-form {
    padding: 16px 12px;
  }

  .toggle-buttons {
    flex-direction: column;
  }
}
</style>
