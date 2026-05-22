<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport
    v-else
    :title="title"
    :routes="routes"
    :service="service"
    :v$="v$"
    :params="params"
    :show-btn-generate="true"
  >
    <FilterAcademicPeriodWithLevels
      :academic-periods="filters.academicPeriods"
      :permission="permission"
      :v$="v$"
    >
    </FilterAcademicPeriodWithLevels>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';

import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';

import { required } from '../../../shared/plugins/vuelidate.plugin';
import { PostNotesByActivityCategoriesService } from '../services/filters/postNotesByActivityCategories.service';
import { GetRelatedDataReportEndOfYearService } from '../services/filters/getRelatedDataReportEndOfYear.service';
import { useHeaderStore } from '../../../stores/header.store';

const getRelatedDataReportEndOfYearService =
  new GetRelatedDataReportEndOfYearService();

export default defineComponent({
  name: 'ReportNotesByActivityCategories',
  components: {
    FilterAcademicPeriodWithLevels,
    BaseReport,
    AppLoading,
  },
  setup() {
    const title = 'reports.notesByActivityCategories';
    const permission = 'reports.evaluations.notesByActivityCategories';
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
    const filters = ref<any>({
      academicPeriods: [],
      options: {},
    });
    const service = new PostNotesByActivityCategoriesService();

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: { required },
          groupId: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getRelatedDataReportEndOfYearService.run();
      loading.value = false;
    });

    return {
      title,
      permission,
      routes,
      loading,
      filters,
      service,
      v$,
      params,
    };
  },
});
</script>

<style scoped></style>
