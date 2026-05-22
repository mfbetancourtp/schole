<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :showBtnGenerate="false">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :v$="v$" @selectedLevel="selectedLevel" />

    <div class="form-row">
      <FilterPeriods :v$="v$" :academic-periods="filters.academicPeriods" @selectedPeriod="selectedPeriod" @getPeriods="getIdLastPeriod" />

      <div class="mb-3 tw-flex-1 pt-4">
        <AppFormField v-if="!isQualitativeGrading" class="form-check form-switch" :form-control="v$.form.showMinGradeToPass" label="Mostrar nota mínima para aprobar">
          <input class="form-check-input" type="checkbox" role="switch" id="showMinGradeToPass" v-model="v$.form.showMinGradeToPass.$model" />
        </AppFormField>

        <AppFormField class="form-check form-switch" :form-control="v$.form.showFinNote" label="Mostrar nota final">
          <input class="form-check-input" type="checkbox" role="switch" id="showFinNote" v-model="v$.form.showFinNote.$model" />
        </AppFormField>
      </div>
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
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersSummaryAveragesHalfUnitService, IGetFiltersSummaryAveragesHalfUnitService } from '../services/filters/getFiltersSummaryAveragesHalfUnit.service';
import { GenerateReportConsolidateFinalService } from '../services/reports/generateReportConsolidateFinal.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersSummaryAveragesHalfUnitService = new GetFiltersSummaryAveragesHalfUnitService();

export default defineComponent({
  name: 'ConsolidatePeriodsNotes',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterPeriods,
    AppLoading,
    BaseReport,
    AppButton,
    ReportProgress,
    AppFormField,
  },

  setup() {
    const title = 'report.final.consolidate.notes';
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

    const service = new GenerateReportConsolidateFinalService();

    const loading = ref(true);
    const loadingGenerate = ref(false);
    const reportId = ref();
    const urlFile = ref();
    const filters = ref<IGetFiltersSummaryAveragesHalfUnitService>({
      academicPeriods: [],
      options: {},
    });
    const filteredOptions = ref({});
    const isQualitativeGrading = ref(true);

    const idLastPeriod = ref<number | null>(null);

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      periodId: null,
      showMinGradeToPass: false,
      showFinNote: false,
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
          showMinGradeToPass: {},
          showFinNote: {},
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
      showMinGradeToPass: form.showMinGradeToPass ? 1 : 0,
      showFinNote: form.showFinNote ? 1 : 0,
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

      loading.value = false;
    });

    const selectedLevel = (level: any) => {
      isQualitativeGrading.value = level.isQualitativeGrading === 1;
    };
    const getIdLastPeriod = (periods: any[]) => {
      form.showFinNote = false;

      if (periods.length > 0) {
        const lastPeriod = periods.reduce((latest, current) => {
          return new Date(current.endDate) > new Date(latest.endDate) ? current : latest;
        });

        idLastPeriod.value = lastPeriod.id;
      }
    };
    const selectedPeriod = (period: any) => {
      if (period.id == idLastPeriod.value) {
        form.showFinNote = true;
      } else {
        form.showFinNote = false;
      }
    };

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
      isQualitativeGrading,

      getIdLastPeriod,
      selectedPeriod,
      selectedLevel,
    };
  },
});
</script>

<style scoped></style>
