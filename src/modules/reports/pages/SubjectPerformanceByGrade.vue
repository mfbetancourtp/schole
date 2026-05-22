<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"></FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
    </div>

    <div class="form-row">
      <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>

      <AppFormField :form-control="v$.form.decimalNumber" label="reports.filters.numberOfDecimals">
        <input id="decimalNumber" class="form-control" type="number" v-model="v$.form.decimalNumber.$model" />
      </AppFormField>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetFiltersSubjectPerformanceByGradeService, IGetFiltersSubjectPerformanceByGradeService } from '../services/filters/getFiltersSubjectPerformanceByGrade.service';
import { GenerateReportSubjectPerformanceByGradeService } from '../services/reports/generateReportSubjectPerformanceByGrade.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersSubjectPerformanceByGradeService = new GetFiltersSubjectPerformanceByGradeService();

export default defineComponent({
  name: 'SubjectPerformanceByGrade',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterShowFields,
    AppFormField,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.subjectPerformanceByGrade';
    const permission = 'reports.evaluations.subjectPerformanceByGrade';
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

    const service = new GenerateReportSubjectPerformanceByGradeService();

    const loading = ref(true);
    const filters = ref<IGetFiltersSubjectPerformanceByGradeService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      studentCategories: [],
      subjectCategories: [],
      showFields: [],
      decimalNumber: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: { required },
          groupId: {},
          studentCategories: {},
          subjectCategories: {},
          showFields: { required },
          decimalNumber: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      studentCategoriesIds: form.studentCategories,
      subjectCategoriesIds: form.subjectCategories,
      decimalNumber: form.decimalNumber,
      options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersSubjectPerformanceByGradeService.run();

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
