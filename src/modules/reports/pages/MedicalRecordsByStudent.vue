<template>
  <BaseReport :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterStudents :v$="v$"></FilterStudents>

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

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GenerateReportMedicalRecordsByStudentService } from '../services/reports/generateReportMedicalRecordsByStudent.service';

export default defineComponent({
  name: 'MedicalRecordsByStudent',
  components: {
    FilterDateRange,
    FilterStudents,
    BaseReport,
  },

  setup() {
    const title = 'reports.medicalRecordsByStudent';
    const permission = 'reports.medicalRecordsByStudent';
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

    const service = new GenerateReportMedicalRecordsByStudentService();

    const form = reactive({
      userId: null,
      startDate: null,
      endDate: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          userId: { required },
          startDate: { required },
          endDate: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      userId: form.userId,
      dateSince: form.startDate,
      dateUntil: form.endDate,
    }));

    return {
      service,
      params,
      routes,
      title,
      v$,

      permission,
    };
  },
});
</script>

<style scoped></style>
