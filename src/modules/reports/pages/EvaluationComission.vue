<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :showBtnGenerate="false">
    <!-- <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithLevels> -->
    <FilterAcademicPeriodWithDegrees :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithDegrees>
    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>
    </div>
    <div class="form-row">
      <div class="d-flex gap-1">
        <AppFormField :form-control="v$.form.signatureColumn">
          <div class="form-check form-switch d-flex gap-1">
            <input type="checkbox" class="form-check-input" v-model="v$.form.signatureColumn.$model" id="signatureColumn" />
            <label for="signatureColumn" class="form-check-label">Agregar columna firma de acudientes</label>
          </div>
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
import FilterAcademicPeriodWithDegrees from '../components/FilterAcademicPeriodWithDegrees.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import ReportProgress from '../components/ReportProgress.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersSummaryAveragesHalfUnitService, IGetFiltersSummaryAveragesHalfUnitService } from '../services/filters/getFiltersSummaryAveragesHalfUnit.service';
import { GenerateReportEvaluationComissionService } from '../services/reports/generateReportEvaluationComission.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersSummaryAveragesHalfUnitService = new GetFiltersSummaryAveragesHalfUnitService();

export default defineComponent({
  name: 'EvaluationComission',
  components: {
    FilterPeriods,
    FilterAcademicPeriodWithDegrees,
    AppLoading,
    BaseReport,
    AppButton,
    ReportProgress,
  },

  setup() {
    const title = 'report.evaluation.comission';
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

    const service = new GenerateReportEvaluationComissionService();

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
      periodId: null,
      signatureColumn: null,
      //showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: {},
          degreeId: {},
          periodId: { required },
          signatureColumn: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      periodId: form.periodId,
      signatureColumn: form.signatureColumn == true ? 1 : 0,
      //options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersSummaryAveragesHalfUnitService.run();

      // Crear una nueva variable sin accumulatePeriods
      console.log(filters.value);
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
