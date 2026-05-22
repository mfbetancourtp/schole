<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <div class="form-row">
      <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriod>

      <FilterTeachers :v$="v$"></FilterTeachers>
    </div>

    <FilterDateRange interval="week" :v$="v$"></FilterDateRange>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>

      <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterTeachers from '../components/FilterTeachers.vue';
import FilterDateRange from '../components/FilterDateRange.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersSummaryTeacherQuickViewService, IGetFiltersSummaryTeacherQuickViewService } from '../services/filters/getFiltersSummaryTeacherQuickView.service';
import { GenerateReportSummaryTeacherQuickViewService } from '../services/reports/GenerateReportSummaryTeacherQuickView.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersSummaryTeacherQuickViewService = new GetFiltersSummaryTeacherQuickViewService();

export default defineComponent({
  name: 'SummaryTeacherQuickView',
  components: {
    FilterSubjectClassification,
    FilterStudentClassification,
    FilterAcademicPeriod,
    FilterShowFields,
    FilterDateRange,
    FilterTeachers,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.summaryTeacherQuickView';
    const permission = 'reports.evaluations.summaryTeacherQuickView';
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

    const service = new GenerateReportSummaryTeacherQuickViewService();

    const loading = ref(true);
    const filters = ref<IGetFiltersSummaryTeacherQuickViewService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      teacherId: null,
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
          teacherId: { required },
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
      dateSince: form.startDate,
      dateUntil: form.endDate,
      subjectCategoriesIds: form.subjectCategories,
      studentCategoriesIds: form.studentCategories,
      academicPeriodId: form.academicPeriodId,
      teacherId: form.teacherId,
      options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersSummaryTeacherQuickViewService.run();

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
