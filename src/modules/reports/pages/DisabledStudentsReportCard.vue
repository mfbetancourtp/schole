<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
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
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetFiltersDisabledStudentsReportCardService, IGetFiltersDisabledStudentsReportCardService } from '../services/filters/getFiltersDisabledStudentsReportCard.service';
import { GenerateReportDisabledStudentsReportCardService } from '../services/reports/generateReportDisabledStudentsReportCard.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersDisabledStudentsReportCardService = new GetFiltersDisabledStudentsReportCardService();

export default defineComponent({
  name: 'DisabledStudentsReportCard',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    FilterPeriods,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.disabledStudentsReportCard';
    const permission = 'reports.cards.disabledStudentsReportCard';
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

    const service = new GenerateReportDisabledStudentsReportCardService();

    const loading = ref(true);
    const filters = ref<IGetFiltersDisabledStudentsReportCardService>({
      academicPeriods: [],
      studentCategories: [],
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      studentCategories: [],
      periodId: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          studentCategories: {},
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
      studentCategoriesIds: form.studentCategories,
      periodId: form.periodId,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersDisabledStudentsReportCardService.run();

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
