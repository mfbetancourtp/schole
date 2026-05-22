<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <div class="form-row">
      <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriod>
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>
      <FilterStudents :v$="v$"></FilterStudents>
    </div>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>
      <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterPeriods from '../components/FilterPeriods.vue';
import FilterStudents from '../components/FilterStudents.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersStudentPerformanceService, IGetFiltersStudentPerformanceService } from '../services/filters/getFiltersStudentPerformance.service';
import { GenerateReportStudentPerformanceService } from '../services/reports/generateReportStudentPerformance.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersStudentPerformanceService = new GetFiltersStudentPerformanceService();

export default defineComponent({
  name: 'StudentPerformance',
  components: {
    FilterSubjectClassification,
    FilterAcademicPeriod,
    FilterShowFields,
    FilterStudents,
    FilterPeriods,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.studentPerformance';
    const permission = 'reports.evaluations.studentPerformance';
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

    const service = new GenerateReportStudentPerformanceService();

    const loading = ref(true);
    const filters = ref<IGetFiltersStudentPerformanceService>({
      academicPeriods: [],
      subjectCategories: [],
      options: {},
    });

    const form = reactive({
      userId: null,
      academicPeriodId: null,
      periodId: null,
      subjectCategories: [],
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          userId: { required },
          academicPeriodId: { required },
          periodId: { required },
          subjectCategories: {},
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      userId: form.userId,
      periodId: form.periodId,
      subjectCategoriesIds: form.subjectCategories,
      options: form.showFields,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersStudentPerformanceService.run();

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
