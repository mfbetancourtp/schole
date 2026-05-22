<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :showBtnGenerate="false">
    <div class="form-row">
      <AppFormField :form-control="v$.form.academicPeriodId" label="core.generalTerms.academic.academicPeriod.singular">
        <AppAutocomplete input-id="academicPeriodId" :options="filters.academicPeriods" v-model="v$.form.academicPeriodId.$model"></AppAutocomplete>
      </AppFormField>
      <AppFormField :form-control="v$.form.periodIds"
                label="core.generalTerms.academic.period.singular">
    <AppAutocomplete input-id="academicPeriodGroupId" :options="periodOptions"
                     v-model="v$.form.periodIds.$model"
                     :disabled="!v$.form.academicPeriodId.$model" :multiple="true"></AppAutocomplete>
  </AppFormField>
    </div>

    <div class="form-row"></div>
    <div class="d-flex justify-content-center">
      <AppButton @click="generate()" label="Generar"></AppButton>
    </div>
    <div class="mt-2" v-if="reportId">
      <ReportProgress :report-id="reportId"></ReportProgress>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref,watch } from 'vue';

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

import { useHeaderStore } from '../../../stores/header.store';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { GenerateConsolidateSemiannualPeriodsNotes } from '../services/reports/generateConsolidateSemiannualPeriodsNotes.service';


const getFiltersSummaryAveragesHalfUnitService = new GetFiltersSummaryAveragesHalfUnitService();

export default defineComponent({
  name: 'ConsolidateSemiannualPeriodsNotes',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterPeriods,
    AppLoading,
    BaseReport,
    AppButton,
    ReportProgress,
    AppFormField,
    AppAutocomplete,
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

    const service = new GenerateConsolidateSemiannualPeriodsNotes();

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

    const form: any = reactive({
      academicPeriodId: null,
      periodIds: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          periodIds: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
        periodIds: Array.isArray(form.periodIds) ? form.periodIds.join(',') : '',

    }));
// 1️⃣ Computed que saca sólo los periods del academicPeriodId seleccionado
    const periodOptions = computed(() => {
      if (!form.academicPeriodId) return [];
      // asumimos que cada elemento de filters.value.academicPeriods tiene { id, name, periods: Period[] }
      const ap = filters.value.academicPeriods.find((p:any) => p.id === form.academicPeriodId);
      return ap?.periods || [];
    });

    // 2️⃣ Cuando cambie el academicPeriodId, limpiamos la selección de periodIds
    watch(() => form.academicPeriodId, () => {
      form.periodIds = null;
      // opcional: resetear la validación
      v$.value.form.periodIds.$reset();
    });
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
      console.log("hola", form);
      
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
      periodOptions,
    };
  },
});
</script>

<style scoped></style>
