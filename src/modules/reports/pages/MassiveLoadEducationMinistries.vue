<template>
  <AppLoading v-if="loading"></AppLoading>

  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>

      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>
    </div>

    <div class="form-row">
      <FilterNumberOfDecimal :v$="v$"></FilterNumberOfDecimal>

      <FilterShowFields :v$="v$" :options="filters.options"></FilterShowFields>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import BaseReport from '../components/BaseReport.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterNumberOfDecimal from '../components/FilterNumberOfDecimal.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterShowFields from '../components/FilterShowFields.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GenerateReportMassiveLoadEducationMinistriesService } from '../services/reports/generateReportMassiveLoadEducationMinistries.service';
import { GetFiltersMassiveLoadEducationMinistriesService } from '../services/filters/getFiltersMassiveLoadEducationMinistries.service';

const getFiltersMassiveLoadEducationMinistriesService = new GetFiltersMassiveLoadEducationMinistriesService();

export default defineComponent({
  name: 'MassiveLoadEducationMinistries',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterNumberOfDecimal,
    FilterShowFields,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.massiveLoadEducationMinistries';
    const permission = 'reports.ministry.massiveLoadEducationMinistries';
    const routes: BreadCrumbsType[] = [
      {
        name: 'reports.name',
        url: { name: 'reports.list' },
      },
      {
        name: title,
      },
    ];

    const service = new GenerateReportMassiveLoadEducationMinistriesService();

    const loading = ref(true);
    const filters = ref({
      academicPeriods: [],
      studentCategories: [],
      subjectCategories: [],
      options: [],
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      studentCategories: [],
      subjectCategories: [],
      numberOfDecimals: null,
      showFields: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          studentCategories: {},
          subjectCategories: {},
          numberOfDecimals: {},
          showFields: {},
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
      decimalNumber: form.numberOfDecimals,
      options: form.showFields,
    }));

    onMounted(async () => {
      filters.value = await getFiltersMassiveLoadEducationMinistriesService.run();

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
