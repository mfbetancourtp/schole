<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <div class="form-row">
      <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriod>

      <FilterTeachers :v$="v$"></FilterTeachers>
    </div>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
    </div>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

      <AppFormField :form-control="v$.form.decimalNumber" label="reports.filters.numberOfDecimals">
        <input id="decimalNumber" class="form-control" type="number" v-model="v$.form.decimalNumber.$model" />
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
import FilterTeachers from '../components/FilterTeachers.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersPeriodSummaryByTeacherService, IGetFiltersPeriodSummaryByTeacherService } from '../services/filters/getFiltersPeriodSummaryByTeacher.service';
import { GenerateReportPeriodSummaryByTeacherService } from '../services/reports/generateReportPeriodSummaryByTeacher.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersPeriodSummaryByTeacherService = new GetFiltersPeriodSummaryByTeacherService();

export default defineComponent({
  name: 'PeriodSummaryByTeacher',
  components: {
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterAcademicPeriod,
    FilterShowFields,
    FilterTeachers,
    FilterPeriods,
    AppFormField,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.periodSummaryByTeacher';
    const permission = 'reports.activity.periodSummaryByTeacher';
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

    const service = new GenerateReportPeriodSummaryByTeacherService();

    const loading = ref(true);
    const filters = ref<IGetFiltersPeriodSummaryByTeacherService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      teacherId: null,
      periodId: null,
      decimalNumber: null,
      studentCategories: [],
      subjectCategories: [],
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          teacherId: { required },
          periodId: { required },
          decimalNumber: {},
          studentCategories: {},
          subjectCategories: {},
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      periodId: form.periodId,
      teacherId: form.teacherId,
      decimalNumber: form.decimalNumber,
      studentCategoriesIds: form.studentCategories,
      subjectCategoriesIds: form.subjectCategories,
      options: form.showFields,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersPeriodSummaryByTeacherService.run();

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
