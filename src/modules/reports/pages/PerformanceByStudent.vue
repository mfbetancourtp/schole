<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <div class="form-row">
      <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriod>

      <FilterStudents :v$="v$"></FilterStudents>
    </div>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>
    </div>

    <div class="form-row">
      <AppFormField :form-control="v$.form.quality" label="reports.filters.quality">
        <input id="quality" class="form-control" type="number" v-model="v$.form.quality.$model" />
      </AppFormField>

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
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersPerformanceByStudentService, IGetFiltersPerformanceByStudentService } from '../services/filters/getFiltersPerformanceByStudent.service';
import { GenerateReportPerformanceByStudentService } from '../services/reports/generateReportPerformanceByStudent.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersPerformanceByStudentService = new GetFiltersPerformanceByStudentService();

export default defineComponent({
  name: 'PerformanceByStudent',
  components: {
    FilterSubjectClassification,
    FilterAcademicPeriod,
    FilterShowFields,
    FilterStudents,
    FilterPeriods,
    AppFormField,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.performanceByStudent';
    const permission = 'reports.evaluations.performanceByStudent';
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

    const service = new GenerateReportPerformanceByStudentService();

    const loading = ref(true);
    const filters = ref<IGetFiltersPerformanceByStudentService>({
      academicPeriods: [],
      subjectCategories: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      userId: null,
      periodId: null,
      subjectCategories: [],
      quality: null,
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          userId: { required },
          periodId: { required },
          subjectCategories: {},
          quality: {},
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
      quality: form.quality,
      options: form.showFields,
      itemCode: permission,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersPerformanceByStudentService.run();

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
