<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :service="service" :v$="v$" :routes="routes" :params="params">
    <FilterAcademicPeriodWithGroups :v$="v$" :academic-periods="filters.academicPeriods" :permission="permission"> </FilterAcademicPeriodWithGroups>

    <FilterDateRange :v$="v$" interval="week"></FilterDateRange>

    <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';

import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';
import FilterDateRange from '../components/FilterDateRange.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';

import { GenerateReportDegreeSummaryService } from '../services/reports/generateReportDegreeSummary.service';
import { GetFiltersDegreeSummaryService } from '../services/filters/getFiltersDegreeSummary.service';
import { IGetFiltersAttendanceByMonthService } from '../services/filters/getFiltersAttendanceByMonth.service';
import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersDegreeSummaryService = new GetFiltersDegreeSummaryService();

export default defineComponent({
  name: 'DegreeSummary',
  components: {
    FilterStudentClassification,
    FilterDateRange,
    FilterAcademicPeriodWithGroups,
    AppLoading,
    BaseReport,
  },
  setup() {
    const title = 'reports.degreeSumary.week';
    const permission = 'reports.activity.degreeSumary.week';
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
    const service = new GenerateReportDegreeSummaryService();
    const loading = ref(true);

    const filters = ref<IGetFiltersAttendanceByMonthService>({
      academicPeriods: [],
      studentCategories: [],
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      startDate: null,
      endDate: null,
      studentCategories: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          startDate: { required },
          endDate: { required },
          studentCategories: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      dateSince: form.startDate,
      dateUntil: form.endDate,
      academicPeriodGroupId: form.academicPeriodGroupId,
      studentCategoriesIds: form.studentCategories,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      try {
        const response = await getFiltersDegreeSummaryService.run();

        filters.value.academicPeriods = response.academicPeriods;
        filters.value.studentCategories = response.studentCategories;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      title,
      service,
      v$,
      loading,
      routes,
      permission,
      filters,
      params,
    };
  },
});
</script>

<style scoped></style>
