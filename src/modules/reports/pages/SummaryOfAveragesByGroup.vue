<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterAcademicPeriodWithGroups :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"></FilterAcademicPeriodWithGroups>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

      <AppFormField :form-control="v$.form.numberOfDecimals" label="reports.filters.numberOfDecimals">
        <input id="numberOfDecimals" class="form-control" type="number" v-model="v$.form.numberOfDecimals.$model" />
      </AppFormField>
    </div>

    <div class="form-row">
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
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersSummaryOfAveragesByGroupService, IGetFiltersSummaryOfAveragesByGroupService } from '../services/filters/getFiltersSummaryOfAveragesByGroup.service';
import { GenerateReportSummaryOfAveragesByGroupService } from '../services/reports/generateReportSummaryOfAveragesByGroup.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersSummaryOfAveragesByGroupService = new GetFiltersSummaryOfAveragesByGroupService();

export default defineComponent({
  name: 'SummaryOfAveragesByGroup',
  components: {
    FilterAcademicPeriodWithGroups,
    FilterSubjectClassification,
    FilterStudentClassification,
    FilterShowFields,
    FilterPeriods,
    AppFormField,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.SummaryOfAveragesByGroup';
    const permission = 'reports.SummaryOfAveragesByGroup';
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

    const service = new GenerateReportSummaryOfAveragesByGroupService();

    const loading = ref(true);
    const filters = ref<IGetFiltersSummaryOfAveragesByGroupService>({
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
      numberOfDecimals: 2,
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
          numberOfDecimals: {},
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodGroupId: form.academicPeriodGroupId,
      periodId: form.periodId,
      studentCategoriesIds: form.studentCategories,
      subjectCategoriesIds: form.subjectCategories,
      decimalNumber: form.numberOfDecimals,
      options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersSummaryOfAveragesByGroupService.run();

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
