<template>
  <AppLoading v-if="loading" />
  <BaseReport v-else :title="title" :v$="v$" :service="service" :params="params">
    <div class="form-row">
      <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$" />
    </div>

    <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$" />
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import BaseReport from '../components/BaseReport.vue';
import FilterPeriods from '../components/FilterPeriods.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';

import { IGetFiltersSummaryAveragesHalfUnitService } from '../services/filters/getFiltersSummaryAveragesHalfUnit.service';

import { GetFiltersSummaryAveragesHalfUnitService } from '../services/filters/getFiltersSummaryAveragesHalfUnit.service';
import { GenerateReportSummaryOfOverallAveragesService } from '../services/reports/generateReportSummaryOfOverallAverages.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersSummaryAveragesHalfUnitService = new GetFiltersSummaryAveragesHalfUnitService();

export default defineComponent({
  name: 'SummaryOfOverallAverages',

  components: {
    FilterAcademicPeriod,
    FilterPeriods,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.summaryOfOverallAverages';
    const permission = 'reports.evaluations.summaryOfOverallAverages';

    const service = new GenerateReportSummaryOfOverallAveragesService();

    const loading = ref(true);

    const filters = ref<IGetFiltersSummaryAveragesHalfUnitService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      periodId: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          periodId: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      periodId: form.periodId,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersSummaryAveragesHalfUnitService.run();

      loading.value = false;
    });

    return {
      loading,
      title,
      v$,

      service,
      params,

      filters,
    };
  },
});
</script>
