<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :routes="routes" :service="service" :v$="v$" :params="params">
    <FilterAcademicPeriodWithGroups :v$="v$" :academic-periods="filters.academicPeriods" :permission="permission"> </FilterAcademicPeriodWithGroups>

    <FilterDateRange :v$="v$" interval="weel"></FilterDateRange>
    <div class="form-row">
      <FilterSubjectClassification :v$="v$" :options="filters.subjectCategories"></FilterSubjectClassification>
      <FilterStudentClassification :v$="v$" :options="filters.studentCategories"></FilterStudentClassification>
    </div>

    <FilterShowFields :v$="v$" :options="filters.options"></FilterShowFields>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';

import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';
import FilterDateRange from '../components/FilterDateRange.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterShowFields from '../components/FilterShowFields.vue';

import { GetFiltersDegreeSummaryQuickViewService, IGetFiltersDegreeSummaryQuickViewService } from '../services/filters/getFiltersDegreeSummaryQuickView.service';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { GenerateReportDegreeSummaryQuickViewService } from '../services/reports/generateReportDegreeSummaryQuickView.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersDegreeSummaryQuickViewService = new GetFiltersDegreeSummaryQuickViewService();

export default defineComponent({
  name: 'DegreeSummaryQuickView',
  components: {
    FilterShowFields,
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterDateRange,
    FilterAcademicPeriodWithGroups,
    BaseReport,
    AppLoading,
  },
  setup() {
    const title = 'reports.DegreeSummaryQuickView';
    const permission = 'reports.evaluations.DegreeSummaryQuickView';
    const routes = [
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

    const loading = ref(true);
    const filters = ref<IGetFiltersDegreeSummaryQuickViewService>({
      academicPeriods: [],
      studentCategories: [],
      subjectCategories: [],
      options: {},
    });
    const service = new GenerateReportDegreeSummaryQuickViewService();

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      startDate: null,
      endDate: null,
      studentCategories: [],
      subjectCategories: [],
      showFields: [],
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          startDate: { required },
          endDate: { required },
          studentCategories: {},
          subjectCategories: {},
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodGroupId: form.academicPeriodGroupId,
      dateSince: form.startDate,
      dateUntil: form.endDate,
      subjectCategoriesIds: form.subjectCategories,
      studentCategoriesIds: form.studentCategories,
      options: form.showFields,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersDegreeSummaryQuickViewService.run();
      loading.value = false;
    });

    return {
      title,
      permission,
      routes,
      loading,
      filters,
      service,
      v$,
      params,
    };
  },
});
</script>

<style scoped></style>
