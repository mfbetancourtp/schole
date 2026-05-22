<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :routes="routes" :v$="v$" :service="service" :params="params">
    <FilterAcademicPeriodWithGroups :v$="v$" :academic-periods="filters.academicPeriods" :permission="permission"> </FilterAcademicPeriodWithGroups>

    <FilterDateRange :v$="v$" interval="month"></FilterDateRange>

    <div class="form-row">
      <FilterCourse :v$="v$"></FilterCourse>
      <FilterStudentClassification :v$="v$" :options="filters.studentCategories"></FilterStudentClassification>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';

import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';
import FilterDateRange from '../components/FilterDateRange.vue';

import { GetFiltersDisciplinaryRecordService, IGetFiltersDisciplinaryRecordService } from '../services/filters/getFiltersDisciplinaryRecord.service';
import { GenerateReportDisciplinaryRecordService } from '../services/reports/generateReportDisciplinaryRecord.service';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import FilterCourse from '../components/FilterCourse.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersDisciplinaryRecordService = new GetFiltersDisciplinaryRecordService();

export default defineComponent({
  name: 'DisciplinaryRecord',
  components: {
    FilterStudentClassification,
    FilterCourse,
    FilterDateRange,
    FilterAcademicPeriodWithGroups,
    BaseReport,
    AppLoading,
  },
  setup() {
    const title = 'reports.disciplinaryRecord';
    const permission = `reports.discipline.disciplinaryRecord`;
    const routes = [
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
    const loading = ref(true);
    const filters = ref<IGetFiltersDisciplinaryRecordService>({
      academicPeriods: [],
      studentCategories: [],
    });
    const service = new GenerateReportDisciplinaryRecordService();

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      startDate: null,
      endDate: null,
      studentCategories: [],
      courseId: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          startDate: { required },
          endDate: { required },
          studentCategories: {},
          courseId: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodGroupId: form.academicPeriodGroupId,
      fecIni: form.startDate,
      fecFin: form.endDate,
      studentCat: form.studentCategories,
      courseId: form.courseId,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      const response = await getFiltersDisciplinaryRecordService.run();

      filters.value.academicPeriods = response.academicPeriods;
      filters.value.studentCategories = response.studentCategories;
      loading.value = false;
    });

    return {
      title,
      loading,
      permission,
      routes,
      filters,
      v$,
      service,
      params,
    };
  },
});
</script>

<style scoped></style>
