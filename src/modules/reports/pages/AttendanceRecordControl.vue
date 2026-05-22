<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport
    v-else
    :title="title"
    :service="service"
    :v$="v$"
    :routes="routes"
    :params="params"
  >
    <FilterAcademicPeriodWithGroups
      :academic-periods="filters.academicPeriods"
      :permission="permission"
      :v$="v$"
    ></FilterAcademicPeriodWithGroups>

    <FilterDateRange interval="week" :v$="v$"></FilterDateRange>

    <FilterSubjectClassification
      :options="filters.subjectCategories"
      :v$="v$"
    ></FilterSubjectClassification>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterDateRange from '../components/FilterDateRange.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import {
  IGetFiltersAttendanceControlService,
  GetFiltersAttendanceControlService,
} from '../services/filters/getFiltersAttendanceControl.service';
import { GenerateAttendanceControlService } from '../services/reports/generateAttendanceControl.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersAttendanceControlService =
  new GetFiltersAttendanceControlService();

export default defineComponent({
  name: 'AttendanceRecordControl',
  components: {
    FilterAcademicPeriodWithGroups,
    FilterSubjectClassification,
    FilterDateRange,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.attendanceRecordControl';
    const permission = 'reports.assistance.attendanceRecordControl';
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

    const service = new GenerateAttendanceControlService();

    const loading = ref(true);
    const filters = ref<IGetFiltersAttendanceControlService>({
      academicPeriods: [],
      subjectCategories: [],
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      startDate: null,
      endDate: null,
      subjectCategories: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          startDate: { required },
          endDate: { required },
          subjectCategories: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      fecIni: form.startDate,
      fecFin: form.endDate,
      academicPeriodGroupId: form.academicPeriodGroupId,
      subjectCat: form.subjectCategories,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      try {
        const response = await getFiltersAttendanceControlService.run();

        filters.value.academicPeriods = response.academicPeriods;
        filters.value.subjectCategories = response.subjectCategories;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      service,
      params,
      routes,
      title,
      v$,

      permission,
      loading,
      filters,
    };
  },
});
</script>

<style scoped></style>
