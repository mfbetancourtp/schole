<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :service="service" :v$="v$" :routes="routes" :params="params">
    <FilterAcademicPeriodWithGroups :v$="v$" :academic-periods="filters.academicPeriods" :permission="permission"> </FilterAcademicPeriodWithGroups>

    <FilterDateRange :v$="v$" :interval="type"></FilterDateRange>

    <div class="form-row">
      <AppFormField :form-control="v$.form.absenceNumber" label="reports.filters.absenceNumber">
        <input id="absenceNumber" class="form-control" type="number" v-model="v$.form.absenceNumber.$model" />
      </AppFormField>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';
import FilterDateRange from '../components/FilterDateRange.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';

import { required } from '../../../shared/plugins/vuelidate.plugin';
import { GenerateReportAttendanceByMonthService } from '../services/reports/generateReportAttendanceByMonth.service';
import { GenerateReportAttendanceByWeekService } from '../services/reports/generateReportAttendanceByWeek.service';
import { GetFiltersAttendanceByMonthService, IGetFiltersAttendanceByMonthService } from '../services/filters/getFiltersAttendanceByMonth.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersAttendanceByMonthService = new GetFiltersAttendanceByMonthService();

export default defineComponent({
  name: 'AttendancePage',
  components: {
    FilterStudentClassification,
    AppFormField,
    FilterDateRange,
    AppLoading,
    FilterAcademicPeriodWithGroups,
    BaseReport,
  },
  setup() {
    const route = useRoute();

    const type = route.params.type as string;

    const title = `reports.attendance.${type}`;
    const permission = `reports.assistance.attendance.${type}`;
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
    const filters = ref<IGetFiltersAttendanceByMonthService>({
      academicPeriods: [],
      studentCategories: [],
    });

    let service = null;

    if (type === 'month') {
      service = new GenerateReportAttendanceByMonthService();
    } else {
      service = new GenerateReportAttendanceByWeekService();
    }

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersAttendanceByMonthService.run();
      loading.value = false;
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      startDate: null,
      endDate: null,
      absenceNumber: null,
      studentCategories: [],
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
        },
      },
      { form }
    );

    const params = computed(() => ({
      fecIni: form.startDate,
      fecFin: form.endDate,
      studentCat: form.studentCategories,
      numberAttendance: form.absenceNumber,
      academicPeriodGroupId: form.academicPeriodGroupId,
    }));

    return {
      type,
      title,
      routes,
      permission,
      loading,
      service,
      v$,
      filters,
      params,
    };
  },
});
</script>

<style scoped></style>
