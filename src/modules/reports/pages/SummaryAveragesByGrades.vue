<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"></FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>

      <AppFormField :form-control="v$.form.decimalNumber" label="reports.filters.numberOfDecimals">
        <input id="numberOfDecimals" class="form-control" type="number" v-model="v$.form.decimalNumber.$model" />
      </AppFormField>
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
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersSummaryAveragesByGradesService, IGetFiltersSummaryAveragesByGradesService } from '../services/filters/getFiltersSummaryAveragesByGrades.service';
import { GenerateReportSummaryAveragesByGradesService } from '../services/reports/generateReportSummaryAveragesByGrades.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersSummaryAveragesByGradesService = new GetFiltersSummaryAveragesByGradesService();

export default defineComponent({
  name: 'SummaryAveragesByGrades',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterShowFields,
    FilterPeriods,
    AppFormField,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.summaryAveragesByGrades';
    const permission = 'reports.evaluations.summaryAveragesByGrades';
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

    const service = new GenerateReportSummaryAveragesByGradesService();

    const loading = ref(true);
    const filters = ref<IGetFiltersSummaryAveragesByGradesService>({
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
      periodId: null,
      decimalNumber: null,
      showFields: [],
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
          periodId: { required },
          decimalNumber: {},
          showFields: { required },
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
      periodId: form.periodId,
      decimalNumber: form.decimalNumber,
      options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersSummaryAveragesByGradesService.run();

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
