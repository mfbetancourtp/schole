<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :routes="routes" :service="service" :v$="v$" :params="params" :show-btn-generate="true">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"> </FilterAcademicPeriodWithLevels>
    <div class="form-row">
      <FilterSubjectClassification :v$="v$" :options="filters.subjectCategories"></FilterSubjectClassification>
      <FilterStudentClassification :v$="v$" :options="filters.studentCategories"></FilterStudentClassification>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';

import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';

import { GetRelatedDataReportEndOfYearService } from '../services/filters/getRelatedDataReportEndOfYear.service';
import { PostNoteFinalsService } from '../services/filters/postNoteFinals.service';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useHeaderStore } from '../../../stores/header.store';

const getRelatedDataReportEndOfYearService = new GetRelatedDataReportEndOfYearService();

export default defineComponent({
  name: 'ReportNoteFinal',
  components: {
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterAcademicPeriodWithLevels,
    BaseReport,
    AppLoading,
  },
  setup() {
    const title = 'reports.noteFinal';
    const permission = 'reports.evaluations.noteFinal';
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
      studentCategories: [],
      subjectCategories: [],
      options: {},
    });
    const service = new PostNoteFinalsService();

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      convertTo: 'pdf',
      studentCategories: [],
      subjectCategories: [],
      itemCode: permission,
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          convertTo: { required },
          studentCategories: {},
          subjectCategories: {},
          itemCode: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      studentCat: form.studentCategories,
      subjectCat: form.subjectCategories,
      itemCode: permission,
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
