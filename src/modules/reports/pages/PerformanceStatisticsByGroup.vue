<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterAcademicPeriodWithGroups :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithGroups>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
    </div>

    <div class="form-row">
      <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>

      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

      <AppFormField :form-control="v$.form.parametric" label="reports.filters.parametric">
        <input id="parametric" class="form-control" type="number" v-model="v$.form.parametric.$model" />
      </AppFormField>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import BaseReport from '../components/BaseReport.vue';
import FilterPeriods from '../components/FilterPeriods.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { IGetFiltersPerformanceStatisticsByGroupService } from '../services/filters/getFiltersPerformanceStatisticsByGroup.service';

import { GetFiltersPerformanceStatisticsByGroupService } from '../services/filters/getFiltersPerformanceStatisticsByGroup.service';
import { GenerateReportPerformanceStatisticsByGroupService } from '../services/reports/generateReportPerformanceStatisticsByGroup.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersPerformanceStatisticsByGroupService = new GetFiltersPerformanceStatisticsByGroupService();

export default defineComponent({
  name: 'PerformanceStatisticsByGroup',
  components: {
    FilterAcademicPeriodWithGroups,
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterShowFields,
    FilterPeriods,
    AppFormField,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.performanceStatisticsByGroup';
    const permission = 'reports.evaluations.performanceStatisticsByGroup';
    const routes: BreadCrumbsType[] = [
      {
        name: 'reports.name',
        url: { name: 'reports.list' },
      },
      {
        name: title,
      },
    ];

    const service = new GenerateReportPerformanceStatisticsByGroupService();

    const loading = ref(true);

    const filters = ref<IGetFiltersPerformanceStatisticsByGroupService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      periodId: null,
      studentCategories: [],
      subjectCategories: [],
      itemCode: permission,
      parametric: null,
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          periodId: { required },
          studentCategories: {},
          subjectCategories: {},
          itemCode: { required },
          parametric: { required },
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodGroupId: form.academicPeriodGroupId,
      periodId: form.periodId,
      subjectCategoriesIds: form.subjectCategories,
      studentCategoriesIds: form.studentCategories,
      itemCode: permission,
      parametric: form.parametric,
      options: form.showFields,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersPerformanceStatisticsByGroupService.run();

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
