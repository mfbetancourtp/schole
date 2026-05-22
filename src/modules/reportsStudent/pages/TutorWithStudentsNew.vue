<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport v-else :title="title" :service="service" :v$="v$" :routes="routes" :params="params">
    <FilterAcademicPeriodWithLevels :academic-periods="filters.academicPeriods" :permission="permission" :v$="v$"> </FilterAcademicPeriodWithLevels>

    <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>

    <div class="form-row">
      <FilterShowFields :options="filters.optionsStudent" :show-fields-student="true" :v$="v$"></FilterShowFields>

      <FilterShowFields :options="filters.optionsTutor" :show-fields-tutor="true" :v$="v$"></FilterShowFields>
    </div>
    <div class="form-row">
      <template v-if="showResponseOptionsStudent !== null">
        <FilterShowOptions :v$="v$" :options="showResponseOptionsStudent" :show-options-student="true" :label="'Opciones'"></FilterShowOptions>
      </template>
      <template v-if="showResponseOptionsTutor !== null">
        <FilterShowOptions :v$="v$" :options="showResponseOptionsTutor" :show-options-tutor="true" :label="'Opciones'"></FilterShowOptions>
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
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import FilterShowOptions from '../components/FilterShowOptions.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetFiltersTutorWithStudentsListService, IGetFiltersTutorWithStudentsListService } from '../services/filters/getFiltersTutorWithStudentsList.service';
import { GenerateReportTutorWithStudentsListService } from '../services/reports/generateReportTutorWithStudentsList.serviceNew';
import { GetOptionsRelatedDataTutorService } from '../services/reports/getOptionsRelatedDataTutor.service';
import { GetOptionsRelatedDataService } from '../services/reports/getOptionsRelatedData.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersTutorWithStudentsListService = new GetFiltersTutorWithStudentsListService();
const getOptionsRelatedDataTutor = new GetOptionsRelatedDataTutorService();
const getOptionsRelatedDataService = new GetOptionsRelatedDataService();

export default defineComponent({
  name: 'TutorWithStudents',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    FilterShowFields,
    FilterShowOptions,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.tutorWithStudentsListNew';
    const permission = 'reports.listings.tutorWithStudentsListNew';
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

    const service = new GenerateReportTutorWithStudentsListService();

    const loading = ref(true);
    const showResponseOptionsTutor = ref(null);
    const showResponseOptionsStudent = ref(null);

    const filters = ref<IGetFiltersTutorWithStudentsListService>({
      academicPeriods: [],
      studentCategories: [],
      optionsStudent: {},
      optionsTutor: {},
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      degreeId: null,
      groupId: null,
      studentCategories: [],
      showFieldsStudent: [],
      showFieldsTutor: [],
      optionsStudent: {},
      optionsTutor: {},
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          studentCategories: {},
          showFieldsStudent: { required },
          optionsStudent: {},
          optionsTutor: {},
          showFieldsTutor: { required },
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
      optionsStudent: form.optionsStudent,
      optionsTutor: form.optionsTutor,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      filters.value = await getFiltersTutorWithStudentsListService.run();

      loading.value = false;
    });
    watch(
      () => form.showFieldsTutor,
      async (newShowFields) => {
        try {
          const sectionSelect = Object.keys(newShowFields).filter((key) => newShowFields[key]);
          const formattedSectionSelected = sectionSelect.map((item) => `"${item}"`);

          const optionss = await getOptionsRelatedDataTutor.run({
            sectionSelect: `[${formattedSectionSelected.join(',')}]`,
          });

          showResponseOptionsTutor.value = optionss.options;
          console.log('opciones', showResponseOptionsTutor.value);
        } catch (e) {
          console.log('Error al obtener opciones relacionadas:', e);
        }
      }
    );
    watch(
      () => form.showFieldsStudent,
      async (newShowFields) => {
        try {
          const sectionSelect = Object.keys(newShowFields).filter((key) => newShowFields[key]);
          const formattedSectionSelected = sectionSelect.map((item) => `"${item}"`);

          const options = await getOptionsRelatedDataService.run({
            sectionSelect: `[${formattedSectionSelected.join(',')}]`,
          });

          showResponseOptionsStudent.value = options.options;
          console.log('opciones', showResponseOptionsStudent.value);
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
      showResponseOptionsTutor,
      showResponseOptionsStudent,
    };
  },
});
</script>

<style scoped></style>
