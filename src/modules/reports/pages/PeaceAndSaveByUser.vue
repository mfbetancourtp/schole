<template>
  <AppLoading v-if="loading"></AppLoading>

  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <div class="form-row">
      <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriod>

      <FilterStudents :v$="v$"></FilterStudents>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import BaseReport from '../components/BaseReport.vue';
import FilterStudents from '../components/FilterStudents.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersStudentPerformanceService } from '../services/filters/getFiltersStudentPerformance.service';
import { GenerateReportPeaceAndSaveByUserService } from '../services/reports/generateReportPeaceAndSaveByUser.service';

const getFiltersStudentPerformanceService = new GetFiltersStudentPerformanceService();

export default defineComponent({
  name: 'PeaceAndSaveByUser',
  components: {
    FilterAcademicPeriod,
    FilterStudents,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.peaceAndSaveByUser';
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

    const service = new GenerateReportPeaceAndSaveByUserService();

    const loading = ref(true);
    const filters = ref<any>({
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      userId: null,
      academicPeriodId: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          userId: { required },
          academicPeriodId: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      userId: form.userId,
    }));

    onMounted(async () => {
      filters.value = await getFiltersStudentPerformanceService.run();

      loading.value = false;
    });

    return {
      service,
      params,
      routes,
      title,
      v$,

      loading,
      filters,
    };
  },
});
</script>

<style scoped></style>
