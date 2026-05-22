<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :service="service" :v$="v$" :routes="routes" :params="params">
    <FilterAcademicPeriodWithGroups :v$="v$" :academic-periods="filters.academicPeriods" :permission="permission"> </FilterAcademicPeriodWithGroups>

    <FilterDateRange :v$="v$" interval="week"></FilterDateRange>

    <div class="form-row">
      <AppFormField :form-control="v$.form.absenceNumber" label="reports.filters.absenceNumber">
        <input id="absenceNumber" class="form-control" type="number" v-model="v$.form.absenceNumber.$model" />
      </AppFormField>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>

      <AppFormField :form-control="v$.form.absenceType" label="reports.filters.absenceType">
        <AppAutocomplete input-id="absenceType" :options="absenceTypes" v-model="v$.form.absenceType.$model"> </AppAutocomplete>
      </AppFormField>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';
import FilterDateRange from '../components/FilterDateRange.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetFiltersDailyAttendanceByGroupService, IGetFiltersDailyAttendanceByGroupService } from '../services/filters/getFiltersDailyAttendanceByGroup.service';
import { GenerateReportDailyAttendanceService } from '../services/reports/generateReportDailyAttendance.service';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersDailyAttendanceByGroupService = new GetFiltersDailyAttendanceByGroupService();

export default defineComponent({
  name: 'DailyAttendanceByGroup',
  components: {
    AppAutocomplete,
    FilterStudentClassification,
    AppFormField,
    FilterDateRange,
    FilterAcademicPeriodWithGroups,
    AppLoading,
    BaseReport,
  },
  setup() {
    const { t } = useI18n();
    const title = 'reports.dailyAttendanceByGroup';
    const permission = 'reports.assistance.dailyAttendanceByGroup';
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
    const service = new GenerateReportDailyAttendanceService();
    const loading = ref(true);

    const filters = ref<IGetFiltersDailyAttendanceByGroupService>({
      academicPeriods: [],
      studentCategories: [],
    });

    const absenceTypes = [
      {
        id: 'general',
        name: t('reports.filters.generalAbsence'),
      },
      {
        id: 'period',
        name: t('reports.filters.periodAbsence'),
      },
    ];

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      startDate: null,
      endDate: null,
      absenceNumber: null,
      studentCategories: [],
      absenceType: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          startDate: { required },
          endDate: { required },
          absenceNumber: { required },
          studentCategories: {},
          absenceType: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      fecIni: form.startDate,
      fecFin: form.endDate,
      academicPeriodGroupId: form.academicPeriodGroupId,
      studentCat: form.studentCategories,
      numberAttendance: form.absenceNumber,
      absenceType: form.absenceType,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      try {
        const response = await getFiltersDailyAttendanceByGroupService.run();

        filters.value.academicPeriods = response.academicPeriods;
        filters.value.studentCategories = response.studentCategories;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      title,
      permission,
      routes,
      filters,
      service,
      loading,
      v$,
      params,
      absenceTypes,
    };
  },
});
</script>

<style scoped></style>
