<template>
  <BaseReport :title="title" :service="service" :v$="v$" :routes="routes" :params="params">
    <FilterUsers :v$="v$">
    </FilterUsers>
    
    <FilterDateRange interval="month" 
      :v$="v$" 
    ></FilterDateRange>
  </BaseReport>
</template>

<script lang="ts">
import {computed, defineComponent, reactive, ref} from 'vue';

import {useVuelidate} from '@vuelidate/core';
import {required} from '../../../shared/plugins/vuelidate.plugin';

import BaseReport from '../components/BaseReport.vue';
import FilterDateRange from '../components/FilterDateRange.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import FilterUsers from '../components/FilterUsers.vue';

import {BreadCrumbsType} from '../../../shared/types/breadCrumbs.type';

import {GenerateReportNotificationsReceptionService} from '../services/reports/generateReportNotificationsReception.service';
import { useHeaderStore } from '../../../stores/header.store';

export default defineComponent({
  name: 'NotificationsReception',
  components: {
    FilterDateRange,
    FilterUsers,
    AppLoading,
    BaseReport,
  },

  setup() {
    const title = 'reports.notificationsReception';
    const permission = 'reports.communications.notificationsReception';
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

    const service = new GenerateReportNotificationsReceptionService();

    const form = reactive({
      userId: null,
      startDate: null,
      endDate: null,
    });
    const v$ = useVuelidate({
      form: {
        userId: {required},
        startDate: {required},
        endDate: {required},
      },
    }, {form});

    const params = computed(() => ({
      userId: form.userId,
      fecIni: form.startDate,
      fecFin: form.endDate,
    }));

    const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

    return {
      service,
      params,
      routes,
      title,
      v$,

      permission,
    };
  },
});
</script>

<style scoped>

</style>
