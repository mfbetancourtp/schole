<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <div class="form-row">
      <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriod>

      <FilterStudents :v$="v$"></FilterStudents>
    </div>

    <FilterDateRange interval="month" :v$="v$"></FilterDateRange>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterStudents from '../components/FilterStudents.vue';
import FilterDateRange from '../components/FilterDateRange.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersStudentDisciplinarySummaryService, IGetFiltersStudentDisciplinarySummaryService } from '../services/filters/getFiltersStudentDisciplinarySummary.service';
import { GenerateReportStudentDisciplinarySummaryService } from '../services/reports/generateReportStudentDisciplinarySummary.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersStudentDisciplinarySummaryService = new GetFiltersStudentDisciplinarySummaryService();

export default defineComponent({
  name: 'StudentDisciplinarySummary',
  components: {
    FilterAcademicPeriod,
    FilterDateRange,
    FilterStudents,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.studentDisciplinarySummary';
    const permission = 'reports.discipline.studentDisciplinarySummary';
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

    const service = new GenerateReportStudentDisciplinarySummaryService();

    const loading = ref(true);
    const filters = ref<IGetFiltersStudentDisciplinarySummaryService>({
      academicPeriods: [],
    });

    const form = reactive({
      academicPeriodId: null,
      userId: null,
      startDate: null,
      endDate: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          userId: { required },
          startDate: { required },
          endDate: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      userId: form.userId,
      fecIni: form.startDate,
      fecFin: form.endDate,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersStudentDisciplinarySummaryService.run();

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
