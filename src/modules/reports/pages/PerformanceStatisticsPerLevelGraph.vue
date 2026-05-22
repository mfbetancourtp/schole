<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'reports.list' }"></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppCard>
        <template #body>
          <!-- Filter form -->
          <section>
            <div class="form-row">
              <FilterAcademicPeriod :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriod>

              <FilterLevel :academic-periods="filters.academicPeriods" :v$="v$"></FilterLevel>
            </div>

            <div class="form-row">
              <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

              <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>

              <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>
            </div>

            <div class="form-row">
              <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

              <AppFormField :form-control="v$.form.parametric" label="reports.filters.parametric">
                <input id="parametric" class="form-control" type="number" v-model="v$.form.parametric.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.parametricRisk" label="reports.filters.parametricRisk">
                <input id="parametricRisk" class="form-control" type="number" v-model="v$.form.parametricRisk.$model" />
              </AppFormField>
            </div>

            <div class="d-flex justify-content-end">
              <AppButton @click="generate" label="Generar"></AppButton>
            </div>
          </section>

          <AppLoading v-if="loadingGenerate"></AppLoading>

          <section v-if="!loadingGenerate && dataGraph">
            <table class="table">
              <thead>
                <tr>
                  <th class="col-3">Grado</th>
                  <th class="text-center">Total alumnos aprobados</th>
                  <th class="text-center">Total alumnos reprobados</th>
                  <th class="text-center">Total alumnos</th>
                  <th class="text-center">Porcentaje de alumnos aprobados</th>
                  <th class="text-center">Total alumnos en riesgo</th>
                  <th class="text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in dataTable1" :key="index">
                  <td>{{ item.row[0].text }}</td>
                  <td class="text-center">{{ item.row[1].text }}</td>
                  <td class="text-center">{{ item.row[2].text }}</td>
                  <td class="text-center">{{ item.row[3].text }}</td>
                  <td class="text-center">{{ item.row[4].text }}</td>
                  <td class="text-center">{{ item.row[5].text }}</td>
                  <td class="text-center">{{ item.row[6].text }}</td>
                </tr>
              </tbody>
            </table>

            <hr />

            <h5>Lista de Alumnos Reprobados</h5>

            <table class="table">
              <thead>
                <tr>
                  <th>Nombre alumno</th>
                  <th>Grado</th>
                  <th class="text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!dataTable2.length">
                  <td colspan="3">
                    <AppEmptyResponse :show-image="true" :subtitle="false"></AppEmptyResponse>
                  </td>
                </tr>
                <tr v-else v-for="(item, index) in dataTable2" :key="index">
                  <td>{{ item.row[0].text }}</td>
                  <td>{{ item.row[1].text }}</td>
                  <td class="text-center">{{ item.row[2].text }}</td>
                </tr>
              </tbody>
            </table>

            <hr />

            <Bar id="my-chart-id" :options="chartOptions" :data="chartData" />
          </section>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { Bar } from 'vue-chartjs';

import FilterLevel from '../components/FilterLevel.vue';
import FilterPeriods from '../components/FilterPeriods.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import FilterAcademicPeriod from '../components/FilterAcademicPeriod.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { IGetFiltersPerformanceStatisticsPerLevelService } from '../services/filters/getFiltersPerformanceStatisticsPerLevel.service';

import { GetFiltersPerformanceStatisticsPerLevelService } from '../services/filters/getFiltersPerformanceStatisticsPerLevel.service';
import { GenerateReportPerformanceStatisticsByLevelWithGraphService } from '../services/reports/generateReportPerformanceStatisticsByLevelWithGraph.service';
import { useHeaderStore } from '../../../stores/header.store';

const generateReportPerformanceStatisticsByLevelWithGraphService = new GenerateReportPerformanceStatisticsByLevelWithGraphService();
const getFiltersPerformanceStatisticsPerLevelService = new GetFiltersPerformanceStatisticsPerLevelService();

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default defineComponent({
  name: 'PerformanceStatisticsPerLevelGraph',
  components: {
    FilterStudentClassification,
    FilterSubjectClassification,
    FilterAcademicPeriod,
    AppEmptyResponse,
    FilterShowFields,
    FilterPeriods,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    FilterLevel,
    AppLoading,
    AppButton,
    AppCard,
    Bar,
  },

  setup() {
    const title = 'reports.performanceStatisticsByLevelWithGraph';
    const permission = 'reports.performanceStatisticsByLevelWithGraph';
    const routes: BreadCrumbsType[] = [
      {
        name: 'reports.name',
        url: { name: 'reports.list' },
      },
      {
        name: title,
      },
    ];

    const dataTable1: Ref<any[]> = ref([]);
    const dataTable2: Ref<any[]> = ref([]);
    const dataGraph: Ref<any> = ref();

    const loadingGenerate = ref(false);
    const loading = ref(true);

    const filters = ref<IGetFiltersPerformanceStatisticsPerLevelService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      levelId: null,
      periodId: null,
      studentCategories: [],
      subjectCategories: [],
      itemCode: 'reports.performanceStatisticsPerLevel',
      parametricRisk: null,
      parametric: null,
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          periodId: { required },
          studentCategories: {},
          subjectCategories: {},
          itemCode: { required },
          parametric: { required },
          parametricRisk: { required },
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      periodId: form.periodId,
      studentCategories: form.studentCategories,
      subjectCategoriesIds: form.subjectCategories,
      parametric: form.parametric,
      itemCode: permission,
      parametricRisk: form.parametricRisk,
      options: form.showFields,
    }));

    const chartData = computed(() => ({
      labels: dataGraph.value.labels,
      datasets: [
        {
          label: 'Desempeño por nivel',
          data: dataGraph.value.data,
          backgroundColor: [import.meta.env.VITE_COLOR_PRIMARY as string],
        },
      ],
    }));
    const chartOptions = computed(() => ({
      responsive: true,
    }));

    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      try {
        filters.value = await getFiltersPerformanceStatisticsPerLevelService.run();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const generate = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      loadingGenerate.value = true;
      dataGraph.value = null;

      try {
        const response = await generateReportPerformanceStatisticsByLevelWithGraphService.run(params.value);
        dataTable1.value = response.table1;
        dataTable2.value = response.table2;
        dataGraph.value = response.graph;
      } catch (e) {
        console.log(e);
      }

      loadingGenerate.value = false;
    };

    return {
      loading,
      routes,
      title,
      v$,

      loadingGenerate,
      chartOptions,
      dataTable1,
      dataTable2,
      dataGraph,
      chartData,
      filters,

      generate,
    };
  },
});
</script>

<style scoped></style>
