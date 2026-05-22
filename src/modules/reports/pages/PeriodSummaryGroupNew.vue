<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :service="service" :v$="v$" :routes="routes" :params="params">
    <FilterAcademicPeriodWithGroups :v$="v$" :academic-periods="filters.academicPeriods" :permission="permission"> </FilterAcademicPeriodWithGroups>

    <div class="form-row">
      <FilterPeriods :v$="v$" :academic-periods="filters.academicPeriods"></FilterPeriods>
      <FilterNumberOfDecimal :v$="v$"></FilterNumberOfDecimal>
    </div>

    <div class="form-row">
      <FilterShowFields :v$="v$" :options="filters.options"></FilterShowFields>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';

import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';
import FilterPeriods from '../components/FilterPeriods.vue';
import FilterNumberOfDecimal from '../components/FilterNumberOfDecimal.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetFiltersPeriodSummaryByGroupService, IGetFiltersPeriodSummaryByGroupService } from '../services/filters/getFiltersPeriodSummaryByGroup.service';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import FilterShowFields from '../components/FilterShowFields.vue';
import { GenerateReportPeriodSummaryGroupNewService } from '../services/reports/generateReportPeriodSummaryGroupNew.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersPeriodSummaryByGroupService = new GetFiltersPeriodSummaryByGroupService();

export default defineComponent({
  name: 'PeriodSummaryByGroup',
  components: {
    FilterShowFields,
    FilterNumberOfDecimal,
    FilterPeriods,
    FilterAcademicPeriodWithGroups,
    AppLoading,
    BaseReport,
  },
  setup() {
    const title = 'reports.periodSummaryByGroupNew';
    const permission = 'reports.activity.periodSummaryByGroupNew';
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
    const service = new GenerateReportPeriodSummaryGroupNewService();
    const loading = ref(true);

    const filters = ref<IGetFiltersPeriodSummaryByGroupService>({
      academicPeriods: [],
      studentCategories: [],
      subjectCategories: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      periodId: null,
      showFields: [],
      numberOfDecimals: null,
      studentCategories: [],
      subjectCategories: [],
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          periodId: { required },
          showFields: { required },
          numberOfDecimals: {},
          studentCategories: {},
          subjectCategories: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodGroupId: form.academicPeriodGroupId,
      periodId: form.periodId,
      studentCategoriesIds: form.studentCategories,
      subjectCategories: form.subjectCategories,
      numberDecimals: form.numberOfDecimals,
      options: form.showFields,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersPeriodSummaryByGroupService.run();

      loading.value = false;
    });

    return {
      title,
      permission,
      routes,
      service,
      loading,
      v$,
      params,
      filters,
    };
  },
});
</script>

<style scoped></style>
