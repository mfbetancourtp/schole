<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterAcademicPeriodWithGroups :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"></FilterAcademicPeriodWithGroups>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <FilterCourse :v$="v$"></FilterCourse>
    </div>

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
import FilterPeriods from '../components/FilterPeriods.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';
import FilterCourse from '../components/FilterCourse.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersStudentPerformanceByGroupService, IGetFiltersStudentPerformanceByGroupService } from '../services/filters/getFiltersStudentPerformanceByGroup.service';
import { GenerateReportStudentPerformanceByGroupService } from '../services/reports/generateReportStudentPerformanceByGroup.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersStudentPerformanceByGroupService = new GetFiltersStudentPerformanceByGroupService();

export default defineComponent({
  name: 'StudentPerformanceByGroup',
  components: {
    FilterAcademicPeriodWithGroups,
    FilterSubjectClassification,
    FilterStudentClassification,
    FilterShowFields,
    FilterPeriods,
    FilterCourse,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.studentPerformanceByGroup';
    const permission = 'reports.evaluations.studentPerformanceByGroup';
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

    const service = new GenerateReportStudentPerformanceByGroupService();

    const loading = ref(true);
    const filters = ref<IGetFiltersStudentPerformanceByGroupService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      periodId: null,
      courseId: null,
      studentCategories: [],
      subjectCategories: [],
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          periodId: { required },
          courseId: {},
          studentCategories: {},
          subjectCategories: {},
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      subjectCategoriesIds: form.subjectCategories,
      studentCategoriesIds: form.studentCategories,
      academicPeriodId: form.academicPeriodId,
      academicPeriodGroupId: form.academicPeriodGroupId,
      options: form.showFields,
      periodId: form.periodId,
      courseId: form.courseId,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersStudentPerformanceByGroupService.run();

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
