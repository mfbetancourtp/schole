<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterStudents :v$="v$"></FilterStudents>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterStudents from '../components/FilterStudents.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersStudentInformationService, IGetFiltersStudentInformationService } from '../services/filters/getFiltersStudentInformation.service';
import { GenerateReportStudentInformationService } from '../services/reports/generateReportStudentInformation.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersStudentInformationService = new GetFiltersStudentInformationService();

export default defineComponent({
  name: 'StudentInformation',
  components: {
    FilterStudents,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.studentInformation';
    const permission = 'reports.listings.studentInformation';
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

    const service = new GenerateReportStudentInformationService();

    const loading = ref(true);
    const filters = ref<IGetFiltersStudentInformationService>({
      options: {},
    });

    const form = reactive({
      userId: null,
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          userId: { required },
          showFields: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      userId: form.userId,
      options: form.showFields,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = { options: {} };

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
