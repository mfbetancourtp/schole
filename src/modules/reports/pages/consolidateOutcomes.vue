<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :showBtnGenerate="false">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>
    </div>

    <div class="form-row"></div>
    <div class="d-flex justify-content-center">
      <AppButton @click="generate" label="Generar"></AppButton>
    </div>
    <div class="mt-2" v-if="reportId">
      <ReportProgress :report-id="reportId"></ReportProgress>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterPeriods from '../components/FilterPeriods.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import ReportProgress from '../components/ReportProgress.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersSummaryAveragesHalfUnitService, IGetFiltersSummaryAveragesHalfUnitService } from '../services/filters/getFiltersSummaryAveragesHalfUnit.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GenerateReportConsolidateOutcomesService } from '../services/reports/generateReportConsolidateOutcomes.service';

const getFiltersSummaryAveragesHalfUnitService = new GetFiltersSummaryAveragesHalfUnitService();

export default defineComponent({
  name: 'reportsConsolidateOutcomes',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterPeriods,
    AppLoading,
    BaseReport,
    AppButton,
    ReportProgress,
  },

  setup() {
    const title = 'reportsConsolidateOutcomes';
    const permission = 'reports.evaluations.summaryAveragesHalfUnit';
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

    const service = new GenerateReportConsolidateOutcomesService();

    const loading = ref(true);
    const loadingGenerate = ref(false);
    const reportId = ref();
    const urlFile = ref();
    const filters = ref<IGetFiltersSummaryAveragesHalfUnitService>({
      academicPeriods: [],
      options: {},
    });
    const filteredOptions = ref({});

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      periodId: null,
      //showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: { required },
          groupId: {},
          periodId: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      periodId: form.periodId,
      //options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersSummaryAveragesHalfUnitService.run();

      // Crear una nueva variable sin accumulatePeriods
      filteredOptions.value = Object.fromEntries(Object.entries(filters.value.options).filter(([key]) => key !== 'accumulatePeriods'));

      console.log('filteredOptions', filteredOptions.value);

      loading.value = false;
    });

    const generate = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      loadingGenerate.value = true;

      try {
        //if (form.academicPeriodGroupId) {
        console.log(params.value);
        const response = await service.run(params.value);
        reportId.value = response.reportId;
        urlFile.value = response.urlFile;
        //}
      } catch (e) {
        console.log('error', e);
      }

      loadingGenerate.value = false;
    };

    return {
      service,
      params,
      routes,
      title,
      v$,

      permission,
      loading,
      filters,
      filteredOptions,
      generate,
      reportId,
    };
  },
});
</script>

<style scoped></style>
