<template>
  <AppLoading v-if="loading"></AppLoading>

  <BaseReport v-else :title="title" :service="service" :v$="v$" :routes="routes" :params="params">
    <FilterAcademicPeriodWithGroups :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"></FilterAcademicPeriodWithGroups>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import BaseReport from '../components/BaseReport.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { IGetFiltersStatusActivitiesService } from '../services/filters/getFiltersStatusActivities.service';

import { GetFiltersStatusActivitiesService } from '../services/filters/getFiltersStatusActivities.service';
import { GenerateSummaryCompetenciesService } from '../services/reports/generateSummaryCompetencies.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersStatusActivitiesService = new GetFiltersStatusActivitiesService();

export default defineComponent({
  name: 'SummaryOfCompetencies',
  components: {
    FilterAcademicPeriodWithGroups,
    FilterSubjectClassification,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.summaryCompetencies';
    const permission = 'reports.evaluations.summaryCompetencies';

    const routes: BreadCrumbsType[] = [
      {
        name: 'reports.name',
        url: { name: 'reports.list' },
      },
      {
        name: title,
      },
    ];

    const service = new GenerateSummaryCompetenciesService();

    const loading = ref(true);

    const filters = ref<IGetFiltersStatusActivitiesService>({
      academicPeriods: [],
      subjectCategories: [],
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      periodId: null,
      subjectCategories: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          subjectCategories: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      subjectCat: form.subjectCategories,
      academicPeriodGroupId: form.academicPeriodGroupId,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      try {
        const response = await getFiltersStatusActivitiesService.run();

        filters.value.academicPeriods = response.academicPeriods;
        filters.value.subjectCategories = response.subjectCategories;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      service,
      params,
      routes,
      title,
      v$,

      permission,
      loading,
      filters,
    };
  },
});
</script>
