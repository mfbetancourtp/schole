<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params" :showBtnGenerate="false">
    <!-- <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithLevels> -->
    <FilterAcademicPeriodWithDegrees :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithDegrees>
    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>
    </div>
    <div class="form-row">
      <FilterSubjectsAll :subjects="subjects" :v$="v$"></FilterSubjectsAll>
    </div>

    <!-- <div class="form-row">
      <div class="d-flex gap-1">
        <AppFormField :form-control="v$.form.signatureColumn">
          <div class="form-check form-switch d-flex gap-1">
            <input type="checkbox" class="form-check-input" v-model="v$.form.signatureColumn.$model" id="signatureColumn" />
            <label for="signatureColumn" class="form-check-label">Agregar columna firma de acudientes</label>
          </div>
        </AppFormField>
      </div>
    </div> -->

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
import FilterSubjectsAll from '../components/FilterSubjectsAll.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriodWithDegrees from '../components/FilterAcademicPeriodWithDegrees.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import ReportProgress from '../components/ReportProgress.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersSummaryAveragesHalfUnitService, IGetFiltersSummaryAveragesHalfUnitService } from '../services/filters/getFiltersSummaryAveragesHalfUnit.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GenerateReportProgressOutcomesTeacherService } from '../services/reports/generateReportProgressOutcomesTeacher.service';
import { GetFiltersSubjectsService } from '../services/filters/getFiltersSubjects.service';
import { GenerateReportReprobationSchoolService } from '../services/reports/generateReportReprobationSchool.service';
import FilterPeriods from '../components/FilterPeriods.vue';

const getFiltersSummaryAveragesHalfUnitService = new GetFiltersSummaryAveragesHalfUnitService();
const getFiltersSubjectsService = new GetFiltersSubjectsService();

export default defineComponent({
  name: 'reprobationSchool',
  components: {
    FilterAcademicPeriodWithDegrees,
    AppLoading,
    BaseReport,
    AppButton,
    ReportProgress,
    FilterSubjectsAll,
    FilterPeriods,
  },

  setup() {
    const title = 'reports.reprobationSchool';
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

    const service = new GenerateReportReprobationSchoolService();

    const loading = ref(true);
    const loadingGenerate = ref(false);
    const reportId = ref();
    const urlFile = ref();
    const filters = ref<IGetFiltersSummaryAveragesHalfUnitService>({
      academicPeriods: [],
      options: {},
    });
    const subjects = ref<any[]>([]);
    const filteredOptions = ref({});

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      periodId: null,
      subjectsIds: [], // en vez de null
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: {},
          periodId: {},
          subjectsIds: {},
          // signatureColumn: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      periodId: form.periodId,
      subjectsIds: form.subjectsIds,
      // signatureColumn: form.signatureColumn == true ? 1 : 0,
      //options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersSummaryAveragesHalfUnitService.run();
      const responseSubjects = await getFiltersSubjectsService.run();

      subjects.value = responseSubjects;
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
      subjects,
      filteredOptions,
      generate,
      reportId,
    };
  },
});
</script>

<style scoped></style>
