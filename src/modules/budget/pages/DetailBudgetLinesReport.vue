<template>
  <AppLoading v-if="loading"></AppLoading>
  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:content>
      <div class="title1">
        <h6>Rubro: {{ dataDetailBudgetReport?.data.heading }}</h6>
      </div>
      <div class="tittle2">
        <h6>Vigencia: {{ dataDetailBudgetReport?.data.academicPeriod }}</h6>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th style="font-size: 0.8rem" class="p-1 pe-0">Cluster</th>
            <th style="font-size: 0.8rem" class="p-1 pe-0">Curso</th>
            <th style="font-size: 0.8rem" class="p-1 pe-0">Asistentes</th>
            <th style="font-size: 0.8rem" class="p-1 pe-0">Estado</th>
            <th style="font-size: 0.8rem" class="p-1 pe-0">Planeado</th>
            <th style="font-size: 0.8rem" class="p-1 pe-0">Ejecutado</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in dataDetailBudgetReport?.detailsReport" :key="index">
            <td class="p-1 pe-0 w-3">
              <span style="font-size: 0.8rem">{{ item.curriculumName }}</span>
            </td>

            <td class="p-1 pe-0 w-2">
              <span style="font-size: 0.8rem">{{ item.coursesName }}</span>
            </td>
            <td class="p-1 pe-0 w-2">
              <span style="font-size: 0.8rem">{{ item.assistants }}</span>
            </td>
            <td class="p-1 pe-0 w-1">
              <span style="font-size: 0.8rem">{{ item.status }}</span>
            </td>
            <td class="p-1 pe-0 w-1">
              <span style="font-size: 0.8rem">{{ n(item.planning, 'currency') }}</span>
            </td>
            <td class="p-1 pe-0 w-1">
              <span style="font-size: 0.8rem">{{ n(item.executed, 'currency') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="budget">
        <h6>
          Presupuesto Total:
          {{ n(dataDetailBudgetReport?.data.budgetTotal, 'currency') }}
        </h6>
        <h6>Planeado: {{ n(dataDetailBudgetReport?.data.planning, 'currency') }}</h6>
        <h6>Ejecutado: {{ n(dataDetailBudgetReport?.data.executed, 'currency') }}</h6>
        <h6>Pendiente: {{ n(dataDetailBudgetReport?.data.earring, 'currency') }}</h6>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';

import { GetDataReportDetailService } from '../services/getDataReportDetail.service';
import { BudgetReportDto } from '../dtos/budgetLinesReport.dto';

const getDataReportDetailService = new GetDataReportDetailService();

export default defineComponent({
  name: 'BudgetLineReport',
  components: {
    AppBaseList,
    AppLoading,
  },

  setup() {
    const { t, n } = useI18n();
    const title = 'Detalle de Presupuesto por Curso';

    const dataDetailBudgetReport = ref<BudgetReportDto>();
    const loading = ref(true);
    const academicPeriods: Ref<any[]> = ref([]);
    const academicPeriodId = ref();
    const budgetLine: Ref<any[]> = ref([]);
    const budgetLineId = ref();
    const route = useRoute();

    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'Reporte Presupuesto General',
        url: { name: 'budget.budgetLinesReport' },
      },
      {
        name: title,
      },
    ];

    onMounted(async () => {
      try {
        academicPeriodId.value = Number(route.params.academicPeriodId);
        budgetLineId.value = Number(route.params.budgetLineId);
        dataDetailBudgetReport.value = await getDataReportDetailService.run(academicPeriodId.value as number, budgetLineId.value);
        console.log('este es un mensjae de emergencia baby', dataDetailBudgetReport.value);
        loading.value = false;
      } catch (error) {
        console.log('this error onmounted', error);
        loading.value = true;
      }
    });
    return {
      loading,
      routes,
      title,
      t,
      n,

      dataDetailBudgetReport,
      academicPeriods,
      academicPeriodId,
      budgetLine,
      budgetLineId,
    };
  },
});
</script>

<style scoped>
.icon_Container {
  align-content: flex-start;
  display: block;
}

.table td {
  vertical-align: middle;
  text-align: center;
}

.table tr {
  vertical-align: middle;
  text-align: center;
}

.title1 {
  text-align: start;
}

.tittle2 {
  text-align: end;
}

.budget {
  text-align: end;
}
</style>
