<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :v$="v$" :routes="routes" :service="service" :params="params">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"></FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

      <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersTeacherByLevelService, IGetFiltersTeacherByLevelService } from '../services/filters/getFiltersTeacherByLevel.service';
import { GenerateReportTeachersByLevelService } from '../services/reports/generateReportTeachersByLevel.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersTeacherByLevelService = new GetFiltersTeacherByLevelService();

export default defineComponent({
  name: 'TeachersByLevel',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterSubjectClassification,
    FilterShowFields,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.teachersByLevel';
    const permission = 'reports.listings.teachersByLevel';
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

    const service = new GenerateReportTeachersByLevelService();

    const loading = ref(true);
    const filters = ref<IGetFiltersTeacherByLevelService>({
      academicPeriods: [],
      subjectCategories: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      subjectCategories: [],
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          subjectCategories: {},
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      subjectCategoriesIds: form.subjectCategories,
      options: form.showFields,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      
      filters.value = await getFiltersTeacherByLevelService.run();

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
