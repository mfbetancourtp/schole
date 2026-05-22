<template>
  <AppLoading v-if="loading"></AppLoading>
  <BaseReport
    v-else
    :title="title"
    :v$="v$"
    :routes="routes"
    :service="service"
    :params="params"
  >
    <div class="form-row">
      <FilterAcademicPeriod
        :academic-periods="academicPeriods"
        :v$="v$"
      ></FilterAcademicPeriod>
      <AppFormField
        :form-control="v$.form.userId"
        label="core.generalTerms.academic.student.singular"
      >
        <AppSearchStudentsNew v-model="v$.form.userId.$model" />
      </AppFormField>
    </div>

    <div class="form-row">
      <AppFormField
        :form-control="v$.form.offenseTemplateId"
        label="Observación"
      >
        <AppAutocomplete
          v-model="v$.form.offenseTemplateId.$model"
          label="offenseTemplate"
          :options="offenseTemplates"
        />
      </AppFormField>
      <AppFormField
        :form-control="v$.form.offenseDisciplinaryId"
        label="Descripción"
      >
        <AppAutocomplete
          v-model="v$.form.offenseDisciplinaryId.$model"
          :options="filteredDisciplinaryOffenses"
          label="description"
        />
      </AppFormField>
    </div>
  </BaseReport>
</template>
<script lang="ts">
import {
  ref,
  defineComponent,
  reactive,
  computed,
  watch,
  onMounted,
} from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppSearchStudentsNew from '../../../shared/components/Forms/AppSearchStudentsNew.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { GetAcademicPeriodsService } from '../../disciplinaryControl/services/getAcademicPeriods.service';
import { GetDisciplinaryOffensesOffensesByUsersService } from '../services/reports/getDisciplinaryOffensesByUsers.service';
import { GenerateDocumentoDisciplinaryOffenseService } from '../services/reports/generateDocumentoDisciplinaryOffense.service';
import { useHeaderStore } from '../../../stores/header.store';
const getDisciplinaryOffenses =
  new GetDisciplinaryOffensesOffensesByUsersService();
const getPeriodsService = new GetAcademicPeriodsService();

export default defineComponent({
  name: 'PerformanceByStudent',
  components: {
    FilterAcademicPeriod,
    AppFormField,
    AppLoading,
    BaseReport,
    AppSearchStudentsNew,
    AppAutocomplete,
  },

  setup() {
    const title = 'observación por estudiante';
    const permission = 'reports.discipline.observationStudent';
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

    const service = new GenerateDocumentoDisciplinaryOffenseService();
    const academicPeriods = ref([]);
    const offenseTemplates = ref([]);
    const filteredDisciplinaryOffenses = ref([]);
    const selectedOffenseTemplate = ref(null);
    const selectedDisciplinaryOffense = ref(null);
    let selectedUserId: any = null;

    const loading = ref(true);

    const form = reactive({
      academicPeriodId: null,
      userId: null,
      offenseTemplateId: null,
      offenseDisciplinaryId: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          userId: { required },
          offenseTemplateId: { required },
          offenseDisciplinaryId: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      offenseDisciplinaryId: form.offenseDisciplinaryId,
    }));

    const loadAcademicPeriods = async () => {
      const allAcademicPeriods = await getPeriodsService.run();
      academicPeriods.value = allAcademicPeriods.filter(
        (period) => period.active === 1
      );
    };

    const loadOffenseTemplates = async (userId) => {
      selectedUserId = userId;
      const response = await getDisciplinaryOffenses.run({ userId });
      const offenseTemplatesArray = response.map((item) => ({
        id: item.disciplinaryOffenses[0].offenseTemplateId,
        offenseTemplate: item.offenseTemplate,
      }));
      offenseTemplates.value = offenseTemplatesArray;
    };
    const loadDisciplinaryOffenses = async () => {
      if (!selectedUserId) return;

      const response = await getDisciplinaryOffenses.run({
        userId: selectedUserId,
      });
      const disciplinaryOffensesArray = response.flatMap((item) =>
        item.disciplinaryOffenses
          .filter(
            (offense) => offense.offenseTemplateId === form.offenseTemplateId
          )
          .map((offense) => ({
            id: offense.id,
            institutionId: offense.institutionId,
            academicPeriodId: offense.academicPeriodId,
            userId: offense.userId,
            userAdviserId: offense.userAdviserId,
            courseId: offense.courseId,
            dateTimeOffense: offense.dateTimeOffense,
            levelOffense: offense.levelOffense,
            offenseTemplateId: offense.offenseTemplateId,
            description: offense.description,
            isSentParents: offense.isSentParents,
            levelOffenseId: offense.levelOffenseId,
            createdAt: offense.createdAt,
            updatedAt: offense.updatedAt,
            offenseTemplateName: offense.offenseTemplateName,
          }))
      );
      filteredDisciplinaryOffenses.value = disciplinaryOffensesArray;
    };

    watch(
      () => form.userId,
      async (newUserId) => {
        if (newUserId) {
          await loadOffenseTemplates(newUserId);
        }
      }
    );

    watch(
      () => form.offenseTemplateId,
      async (newOffenseTemplateId) => {
        if (newOffenseTemplateId) {
          await loadDisciplinaryOffenses(newOffenseTemplateId);
          console.log('jola', filteredDisciplinaryOffenses.value);
        }
      }
    );

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      await loadAcademicPeriods();
      loading.value = false;
    });

    return {
      title,
      permission,
      routes,
      service,
      params,
      loading,
      academicPeriods,
      offenseTemplates,
      filteredDisciplinaryOffenses,
      selectedOffenseTemplate,
      selectedDisciplinaryOffense,
      v$,
    };
  },
});
</script>

<style scoped></style>
