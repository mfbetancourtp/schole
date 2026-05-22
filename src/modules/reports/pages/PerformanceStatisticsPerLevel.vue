<template>
  <AppLoading v-if="loading"></AppLoading>

  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <div class="form-row">
      <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriod>

      <FilterLevel :academic-periods="filters.academicPeriods" :v$="v$"></FilterLevel>
    </div>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>

      <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>
    </div>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

      <AppFormField :form-control="v$.form.parametric" label="reports.filters.parametric">
        <input id="parametric" class="form-control" type="number" v-model="v$.form.parametric.$model" />
      </AppFormField>

      <AppFormField :form-control="v$.form.parametricRisk" label="reports.filters.parametricRisk">
        <input id="parametricRisk" class="form-control" type="number" v-model="v$.form.parametricRisk.$model" />
      </AppFormField>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import BaseReport from '../components/BaseReport.vue';
import FilterLevel from '../components/FilterLevel.vue';
import FilterPeriods from '../components/FilterPeriods.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { IGetFiltersPerformanceStatisticsPerLevelService } from '../services/filters/getFiltersPerformanceStatisticsPerLevel.service';

import { GetFiltersPerformanceStatisticsPerLevelService } from '../services/filters/getFiltersPerformanceStatisticsPerLevel.service';
import { GenerateReportPerformanceStatisticsByLevelService } from '../services/reports/generateReportPerformanceStatisticsByLevel.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersPerformanceStatisticsPerLevelService = new GetFiltersPerformanceStatisticsPerLevelService();

export default defineComponent({
  name: 'PerformanceStatisticsPerLevel',
  components: {
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterAcademicPeriod,
    FilterShowFields,
    FilterPeriods,
    AppFormField,
    FilterLevel,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.performanceStatisticsPerLevel';
    const permission = 'reports.evaluations.performanceStatisticsPerLevel';
    const routes: BreadCrumbsType[] = [
      {
        name: 'reports.name',
        url: { name: 'reports.list' },
      },
      {
        name: title,
      },
    ];

    const service = new GenerateReportPerformanceStatisticsByLevelService();

    const loading = ref(true);

    const filters = ref<IGetFiltersPerformanceStatisticsPerLevelService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      periodId: null,
      studentCategories: [],
      subjectCategories: [],
      itemCode: permission,
      parametric: null,
      parametricRisk: null,
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          periodId: { required },
          studentCategories: {},
          subjectCategories: {},
          itemCode: { required },
          parametric: { required },
          parametricRisk: { required },
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      periodId: form.periodId,
      studentCategories: form.studentCategories,
      subjectCategoriesIds: form.subjectCategories,
      parametric: form.parametric,
      itemCode: permission,
      parametricRisk: form.parametricRisk,
      options: form.showFields,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      try {
        filters.value = await getFiltersPerformanceStatisticsPerLevelService.run();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      loading,
      routes,
      title,
      v$,

      service,
      filters,
      params,
    };
  },
});
</script>

<style scoped></style>
