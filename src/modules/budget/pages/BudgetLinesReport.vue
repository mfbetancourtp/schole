<template>
  <AppLoading v-if="loading"></AppLoading>
  <AppBaseList v-else :title="title" isCard>
    <template v-slot:content>
      <AppEmptyResponse v-if="!academicPeriods.length" :show-image="true" title="Sin vigencias configuradas" :subtitle="false"></AppEmptyResponse>
      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="academicPeriodId" :filter-name="'courseSchedule.academicPeriodId'">
              <label>Vigencia</label>
              <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" class="bg-white"> </AppAutocomplete>
            </AppFilter>
          </div>
        </div>
        <AppEmptyResponse v-if="!dataBudgetReport.length" :show-image="true" subtitle="Sin reportes"> </AppEmptyResponse>
        <template v-else>
          <table class="table">
            <thead>
              <tr>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Rubro</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Coordinador</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Presupuesto</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Planeado</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Ejecutado</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Pendiente</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0 text-center"># Cursos</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in dataBudgetReport" :key="index">
                <td class="p-1 pe-0 w-3">
                  <span style="font-size: 0.8rem">{{ item.headings }}</span>
                </td>

                <td class="p-1 pe-0 w-2">
                  <span style="font-size: 0.8rem">{{ item.nameSupervisorUser }}</span>
                </td>

                <td class="p-1 pe-0 w-2">
                  <span style="font-size: 0.8rem">{{ n(item.budget, 'currency') }}</span>
                </td>

                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem">{{ n(item.planning, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem">{{ n(item.executed, 'currency') }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem">{{ n(item.earring, 'currency') }}</span>
                </td>
                <td>
                  <router-link
                    :to="{
                      name: 'budget.detailBudgetLinesReport',
                      params: {
                        academicPeriodId: academicPeriodId,
                        budgetLineId: item.id,
                      },
                    }"
                  >
                    {{ item.countCourses }}
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetAllAcademicPeriodReportService } from '../services/getAllAcademicPeriodReport.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodsService = new GetAcademicPeriodsService();
const getAllAcademicPeriodReportService = new GetAllAcademicPeriodReportService();

export default defineComponent({
  name: 'BudgetLineReport',
  components: {
    AppBaseList,
    AppLoading,
    AppFilter,
    AppAutocomplete,
    AppEmptyResponse,
  },

  setup() {
    const { t, n } = useI18n();
    const title = 'Reporte Presupuesto General';

    const academicPeriods: Ref<any[]> = ref([]);
    const dataBudgetReport = ref<any[]>([]);
    const academicPeriodId = ref();
    const loadingData = ref(false);
    const loading = ref(true);

    useMeta({ title: t(title) });
    const routes = [
      {
        name: title,
      },
    ];

    onMounted(async () => {
      try {
        academicPeriods.value = await getAcademicPeriodsService.run();
        const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

        if (localfilters && !!localfilters['BudgetLinesReport.academicPeriodId']) {
          if (academicPeriods.value.length) {
            for (let i = 0; i < academicPeriods.value.length; i++) {
              if (localfilters['BudgetLinesReport.academicPeriodId'] == academicPeriods.value[i].id) {
                academicPeriodId.value = await academicPeriods.value[i].id;
              }
            }
          }
        } else {
          if (academicPeriods.value.length) academicPeriodId.value = await academicPeriods.value[0].id;
        }

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Presupuestos', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(academicPeriodId, async (valor) => {
      await getdata();
      console.log('prueba', valor);
    });

    const getdata = async () => {
      loadingData.value = true;
      console.log('data2', academicPeriodId.value);
      dataBudgetReport.value = await getAllAcademicPeriodReportService.run(academicPeriodId.value as number);
      loadingData.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,
      n,

      academicPeriodId,
      academicPeriods,
      loadingData,
      dataBudgetReport,
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
</style>
