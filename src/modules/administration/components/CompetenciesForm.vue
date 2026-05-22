<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <AppButtonBack :to="routes[routes.length - 2].url"></AppButtonBack>

      <AppButton style="color: white" label="core.save" @click="save()"></AppButton>
    </template>

    <template #content>
      <div>
        <div class="row">
          <AppFormField :form-control="v$.form.code" label="classroom.competence.form.code">
            <input type="text" class="form-control" v-model="v$.form.code.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.competencyLevelId" label="classroom.competence.form.level">
            <AppAutocomplete v-model="v$.form.competencyLevelId.$model" :options="competenciesLevels"></AppAutocomplete>
          </AppFormField>

          <AppFormField :form-control="v$.form.competencyTypeId" label="classroom.competence.form.type">
            <AppAutocomplete v-model="v$.form.competencyTypeId.$model" :options="competenciesTypes"></AppAutocomplete>
          </AppFormField>

          <template v-if="level.percentageCompetencies">
            <AppFormField :form-control="v$.form.percentage" :label="'classroom.competence.form.percentage'">
              <input type="number" class="form-control" v-model="v$.form.percentage.$model" />
            </AppFormField>
          </template>
        </div>

        <div class="row">
          <AppFormField :form-control="v$.form.description" label="classroom.competence.form.description">
            <input type="text" class="form-control" v-model="v$.form.description.$model" />
          </AppFormField>

          <AppFormField :form-control="v$.form.periodId" label="classroom.competence.form.period" class="col-4">
            <AppAutocomplete v-model="v$.form.periodId.$model" :options="periods"></AppAutocomplete>
          </AppFormField>
        </div>
      </div>

      <section v-if="competence" class="row gap-2 p-3">
        <template v-if="level.useLearningOutcomes">
          <LearningOutcomes class="col pt-2 pb-2" :competency-id="competence.competency.id" :level="level"></LearningOutcomes>
        </template>

        <template v-if="level.useTopics">
          <Topics class="col pt-2 pb-2" :competency-id="competence.competency.id"></Topics>
        </template>
      </section>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, PropType, reactive, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import Topics from './Topics.vue';
import LearningOutcomes from './LearningOutcomes.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { LevelDto } from '../dtos/level.dto';
import { PeriodDto } from '../dtos/followUpToTopics.dto';
import { CompetenciesTypeDto } from '../dtos/competenciesType.dto';
import { CompetenciesLevelDto } from '../dtos/competenciesLevel.dto';
import { CompetencyWithLearningOutcomeAndTopicDto } from '../dtos/competency.dto';

import { GetListCompetencesService } from '../services/getListCompetences.service';
import { GetActivitiesSummaryService } from '../services/getActivitiesSummary.service';
import { CreateOrUpdateCompetenciesService } from '../services/createOrUpdateCompetencies.service';
import { GetCompetenciesRelatedDataFormService } from '../services/getCompetenciesRelatedDataForm.service';
import { useHeaderStore } from '../../../stores/header.store';

const getCompetenciesRelatedDataFormService = new GetCompetenciesRelatedDataFormService();
const createOrUpdateCompetenciesService = new CreateOrUpdateCompetenciesService();
const getActivitiesSummaryService = new GetActivitiesSummaryService();
const getListCompetencesService = new GetListCompetencesService();

export default defineComponent({
  name: 'CompetenciesForm',
  components: {
    LearningOutcomes,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    Topics,
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
    competence: {
      type: Object as PropType<CompetencyWithLearningOutcomeAndTopicDto | null>,
    },
    level: {
      type: Object as PropType<LevelDto>,
      required: true,
    },
  },

  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const data = props.competence ?? null;
    const courseId = parseInt(route.params.courseId.toString(), 10);
    const curriculumSubjectId = parseInt(route.params.curriculumSubjectId.toString(), 10);
    const academicPeriodGroupId = parseInt(route.params.academicPeriodGroupId.toString(), 10);

    const competenciesLevels: Ref<CompetenciesLevelDto[]> = ref([]);
    const competenciesTypes: Ref<CompetenciesTypeDto[]> = ref([]);
    const periods: Ref<PeriodDto[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      planningWeekId: parseInt(route.query.planningWeekId as string, 10) ?? data?.competency.planningWeekId ?? null,
      curriculumSubjectId: data?.competency.curriculumSubjectId ?? curriculumSubjectId,
      courseId: data?.competency.courseId ?? courseId,

      code: data?.competency.code ?? null,
      competencyLevelId: data?.competency.competencyLevelId ?? null,
      competencyTypeId: data?.competency.competencyTypeId ?? null,
      percentage: data?.competency.percentage ?? null,

      description: data?.competency.description ?? null,
      periodId: data?.competency.periodId ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          planningWeekId: {},
          curriculumSubjectId: { required },
          courseId: {},

          code: { required },
          competencyLevelId: {},
          competencyTypeId: {},
          percentage: {
            requiredIf: requiredIf(() => {
              return props.level?.percentageCompetencies == 1;
            }),
          },

          description: { required },
          periodId: { required },
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

        const activitiesSummary = await getActivitiesSummaryService.run(courseId);
        let relatedData = await getCompetenciesRelatedDataFormService.run();

        competenciesLevels.value = relatedData.competenciesLevels;
        competenciesTypes.value = relatedData.competenciesTypes;
        periods.value = activitiesSummary.periods;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const editRedirection = async () => {
      let competenceId: number | null = null;

      const res = await getListCompetencesService.run(curriculumSubjectId);
      res.forEach((competence: any) => {
        if (
          form.code === competence.code &&
          form.description === competence.description &&
          form.competencyTypeId === competence.competencyTypeId &&
          form.competencyLevelId === competence.competencyLevelId
        ) {
          competenceId = competence.id;
        }
      });

      // const competences = await getListCompetencesService.run(courseId);
      // let competenceId: number | null = null;

      // for (let i = 0; i < competences.length; i++) {
      //   const currentCompetence = competences[i];

      //   if (form.code == currentCompetence.code && form.description == currentCompetence.description) {
      //     competenceId = await currentCompetence.id;
      //   }
      // }

      if (competenceId) {
        const query: any = {};

        if (route.query.planningWeekId) query.planningWeekId = route.query.planningWeekId;

        await router.push({
          name: 'administration.homeTeacher.competencies.edit',

          params: {
            academicPeriodGroupId,
            curriculumSubjectId,
            competenceId,
            courseId,
          },

          query,
        });
      }
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateCompetenciesService.run(form, data?.competency.id);

        if (!data) await editRedirection();
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      v$,

      competenciesLevels,
      competenciesTypes,
      periods,

      save,
    };
  },
});
</script>
