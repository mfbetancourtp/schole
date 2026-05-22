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

    <FilterDateRange interval="month" :v$="v$"></FilterDateRange>

    <div class="form-row">
      <FilterRoles :roles="roles" :v$="v$"></FilterRoles>

      <FilterStudentClassification
        :options="filters.studentCategories"
        :v$="v$"
      ></FilterStudentClassification>
    </div>
  </BaseReport>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import FilterDateRange from '../components/FilterDateRange.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import BaseReport from '../components/BaseReport.vue';
import FilterRoles from '../components/FilterRoles.vue';

import {
  GetFiltersAnnouncementsReceptionService,
  IGetFiltersAnnouncementsReceptionService,
} from '../services/filters/getFiltersAnnouncementsReception.service';
import { GetRolesService } from '../services/filters/getRoles.service';
import { GenerateReportAnnouncementsReceptionService } from '../services/reports/generateReportAnnouncementsReception.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersAnnouncementsReceptionService =
  new GetFiltersAnnouncementsReceptionService();
const getRolesService = new GetRolesService();

export default defineComponent({
  name: 'AnnouncementsReception',
  components: {
    FilterAcademicPeriodWithGroups,
    FilterStudentClassification,
    FilterDateRange,
    FilterRoles,
    AppLoading,
    BaseReport,
  },

  setup() {
    const { t } = useI18n();
    const title = 'reports.announcementsReception';
    const permission = 'reports.communications.announcementsReception';
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

    const service = new GenerateReportAnnouncementsReceptionService();

    const loading = ref(true);
    const roles = ref();
    const filters = ref<IGetFiltersAnnouncementsReceptionService>({
      academicPeriods: [],
      studentCategories: [],
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      startDate: null,
      endDate: null,
      studentCategories: [],
      roles: [] as any,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          startDate: { required },
          endDate: { required },
          studentCategories: {},
          roles: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      fecIni: form.startDate,
      fecFin: form.endDate,
      academicPeriodGroupId: form.academicPeriodGroupId,
      studentCat: form.studentCategories,
      roles: form.roles,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      try {
        const response = await getFiltersAnnouncementsReceptionService.run();
        roles.value = await getRolesService.run();

        filters.value.academicPeriods = response.academicPeriods;
        filters.value.studentCategories = response.studentCategories;

        roles.value.forEach((rol: any) => {
          rol.name = t(rol.name);
          form.roles.push(rol.id);
        });
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
      roles,
    };
  },
});
</script>

<style scoped></style>
