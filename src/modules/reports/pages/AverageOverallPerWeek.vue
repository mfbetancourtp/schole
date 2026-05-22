<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport
    v-else
    :title="title"
    :v$="v$"
    :routes="routes"
    :service="service"
    :params="params"
  >
    <div class="form-row">
      <FilterAcademicPeriod
        :academic-periods="filters.academicPeriods"
        :v$="v$"
      ></FilterAcademicPeriod>

      <FilterLevel
        :academic-periods="filters.academicPeriods"
        :permission="permission"
        :v$="v$"
      ></FilterLevel>
    </div>

    <FilterPeriods
      :academic-periods="filters.academicPeriods"
      :v$="v$"
    ></FilterPeriods>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterLevel from '../components/FilterLevel.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';
import FilterPeriods from '../components/FilterPeriods.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import {
  GetFiltersPerformanceSummaryService,
  IGetFiltersPerformanceSummaryService,
} from '../services/filters/getFiltersPerformanceSummary.service';
import { GenerateReportAcademicPerformanceSummaryService } from '../services/reports/generateReportAcademicPerformanceSummary.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersPerformanceSummaryService =
  new GetFiltersPerformanceSummaryService();

export default defineComponent({
  name: 'AverageOverallPerWeek',
  components: {
    FilterAcademicPeriod,
    FilterPeriods,
    FilterLevel,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.averageOverallPerWeek';
    const permission = 'reports.evaluations.averageOverallPerWeek';
    const routes: BreadCrumbsType[] = [
      {
        name: 'reports.name',
        url: {
          name: 'reports.list',
        },
      },
      {
        name: title,
      },
    ];

    const service = new GenerateReportAcademicPerformanceSummaryService();

    const loading = ref(true);
    const filters = ref<IGetFiltersPerformanceSummaryService>({
      academicPeriods: [],
      studentCategories: [],
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      periodId: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          periodId: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      periodId: form.periodId,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersPerformanceSummaryService.run();

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

<style scoped></style>
