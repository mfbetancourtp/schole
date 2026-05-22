<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :service="service" :v$="v$" :routes="routes" :params="params">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"> </FilterAcademicPeriodWithLevels>

    <div class="form-row">
      <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>

      <FilterShowFields :v$="v$" :options="filters.options" :label="'Secciones'"></FilterShowFields>
      <template v-if="showResponseOptions !== null">
        <FilterShowOptions :v$="v$" :options="showResponseOptions" :label="'Opciones'"></FilterShowOptions>
      </template>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import FilterShowOptions from '../components/FilterShowOptions.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersTutorListService, IGetFiltersTutorListService } from '../services/filters/getFiltersTutorList.service';
import { GenerateReportTutorListService } from '../services/reports/generateReportTutorList.service';
import { GetOptionsRelatedDataTutorService } from '../services/reports/getOptionsRelatedDataTutor.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersTutorListService = new GetFiltersTutorListService();
const getOptionsRelatedDataTutor = new GetOptionsRelatedDataTutorService();

export default defineComponent({
  name: 'TutorList',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    FilterShowFields,
    AppLoading,
    BaseReport,
    FilterShowOptions,
  },

  setup() {
    const title = 'reports.tutorList';
    const permission = 'reports.listings.tutorList';
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

    const service = new GenerateReportTutorListService();

    const loading = ref(true);
    const showResponseOptions = ref(null);
    const filters = ref<IGetFiltersTutorListService>({
      academicPeriods: [],
      studentCategories: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      options: {},
      studentCategories: [],
      showFields: {},
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          studentCategories: {},
          options: {},
          showFields: {},
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
      options: form.options,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersTutorListService.run();
      loading.value = false;
    });
    watch(
      () => form.showFields,
      async (newShowFields) => {
        try {
          const sectionSelect = Object.keys(newShowFields).filter((key) => newShowFields[key]);
          const formattedSectionSelected = sectionSelect.map((item) => `"${item}"`);

          const optionss = await getOptionsRelatedDataTutor.run({
            sectionSelect: `[${formattedSectionSelected.join(',')}]`,
          });

          showResponseOptions.value = optionss.options;
          console.log('opciones', showResponseOptions.value);
        } catch (e) {
          console.log('Error al obtener opciones relacionadas:', e);
        }
      }
    );

    return {
      service,
      params,
      routes,
      title,
      v$,

      permission,
      loading,
      filters,
      showResponseOptions,
    };
  },
});
</script>

<style scoped></style>
