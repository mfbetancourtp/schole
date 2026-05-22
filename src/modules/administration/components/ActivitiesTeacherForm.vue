<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template v-slot:actions>
      <AppButtonBack @click="goBack"></AppButtonBack>
      <AppButton style="color: white" @click="save(goBack)" label="core.save"></AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="form-row">
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
        </div>
        <AppFormField :form-control="v$.form.description" :label="'classroom.activitiesTeacher.form.description'">
          <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control" />

        </AppFormField>

        <div class="form-row">
          <AppFormField :form-control="v$.form.periodId" :label="'academicPlanning.periods.singular'">
            <AppAutocomplete :options="periods" v-model="v$.form.periodId.$model" :input-id="'periodId'"> </AppAutocomplete>
          </AppFormField>
          <AppFormField :form-control="v$.form.rowOrder" :label="'Competencias evaluadas'">
            <AppAutocomplete v-model="v$.form.rowOrder.$model" :options="competencies" label="description"> </AppAutocomplete>
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField v-if="level?.useCompetencies" :form-control="v$.form.learningOutcomesIds" :label="'Indicadores de desempeño evaluados'">
            <AppAutocomplete
              :options="learningOutcomes"
              :label="'description'"
              :multiple="!!!level.usePercentLearningOutcomesWithActivityCategories"
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
        </div>
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

          <AppFormField :form-control="v$.form.deliveryMaxNumberFiles" :label="'classroom.activitiesTeacher.form.deliveryMaxNumberFiles'">
            <input v-model="v$.form.deliveryMaxNumberFiles.$model" class="form-control" type="number" id="deliveryMaxNumberFiles" />
          </AppFormField>

          <AppFormField :form-control="v$.form.attachmentUrl" :label="'classroom.activitiesTeacher.form.attachmentUrl'">
            <AppUploadFile v-model="v$.form.attachmentUrl.$model" :current-file="currentContentAttachmentUrl" input-id="attachmentUrl"></AppUploadFile>
          </AppFormField>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { LevelDto } from '../dtos/level.dto';
import { ActivityDetailDto } from '../dtos/activity.dto';

import { CreateOrUpdateActivityService } from '../services/createOrUpdateActivity.service';
import { GetActivitiesRelatedDataFormService } from '../services/getActivitiesRelatedDataForm.service';
import { GetCompetenciesWithLearningOutcomesService } from '../services/getCompetenciesWithLearningOutcomes.service';
import { GetLearningOutcomesByCompetencyService } from '../services/getLearningOutcomesByCompetency.service';
import { GetLevelByCourseIdService } from '../services/getLevelByCourseId.service';
import { useHeaderStore } from '../../../stores/header.store';
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
  name: 'ActivitiesTeacherForm',
  components: {
    AppAutocomplete,
    AppButtonBack,
    AppUploadFile,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppVoiceInput,
  },

  props: {
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
      required: true,
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
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const data = props.activity ?? null;
    const courseId = parseInt(route.params.courseId.toString(), 10);
    const currentContentAttachmentUrl = data ? data.attachmentUrl : null;

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

    const form: any = reactive({
      planningWeekId: parseInt(route.query.planningWeekId as string, 10) ?? data?.planningWeekId ?? null,

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

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = { name: props.title, url: '' };

        level.value = await getLevelByCourseIdService.run(courseId);
        let response = await getActivitiesRelatedDataFormService.run(courseId, data?.id);

        periods.value = response.periods;
        console.log('periodos', periods.value);
        activityCategories.value = response.activityCategories;
        console.log('categorias', activityCategories.value);
        learningOutcomes.value = await getLearningOutComesByCompetences.run(form.rowOrder);
        console.log('learningout', learningOutcomes.value);
        topics.value = await getTopicsByCompetencyService.run(form.rowOrder);
        console.log('topics', topics.value);
        subtitle.value = response.courseData.name;

        const learningOutcomesIds: any = [];
        response.learningOutcomes.forEach((elemt: any) => {
          if (elemt.checked) {
            learningOutcomesIds.push(elemt.id);
          }
        });

        form.learningOutcomesIds = learningOutcomesIds;

        const topicIds: any = data?.topicIds;

        form.topicIds = topicIds;
        if (form.periodId) {
          await getCompetencies();
        }
        if (data && data.name) {
          let ActivityCategories: any[] = response.activityCategories;
          if (data.activityCategoryId) {
            categoriesByPeriod.value = ActivityCategories.filter((item: any) => item.id == data.activityCategoryId)[0].periodId ? 1 : 0;
          }
        }
      } catch (e) {
        console.log('error', e);
      }

      setTimeout(() => (loading.value = false), 500);
      isOnMounted.value = false;
    });

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

    const goBack = () => {
      router.go(-1);
    };

    const save = async (goBack: any) => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      if (form.description) form.description = form.description.replace(/\n/g, '<br />');

      const dataSend = {
        planningWeekId: form.planningWeekId,
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

        goBack = router.go(-1);
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      v$,
      t,

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

      onFileChange,
      getFile,
      save,
      goBack,

      primaryColor: import.meta.env.VITE_COLOR_PRIMARY,
    };
  },
});
</script>

<style scoped>
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
