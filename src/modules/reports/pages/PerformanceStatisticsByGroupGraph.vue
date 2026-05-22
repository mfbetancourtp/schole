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
            <FilterAcademicPeriodWithGroups :academic-periods="filters.academicPeriods" :v$="v$"></FilterAcademicPeriodWithGroups>

            <div class="form-row">
              <FilterPeriods :academic-periods="filters.academicPeriods" :v$="v$"></FilterPeriods>

              <FilterStudentClassification :options="filters.studentCategories" :v$="v$"></FilterStudentClassification>
            </div>

            <div class="form-row">
              <FilterShowFields :options="filters.options" :v$="v$"></FilterShowFields>

              <FilterSubjectClassification :options="filters.subjectCategories" :v$="v$"></FilterSubjectClassification>

              <AppFormField :form-control="v$.form.parametric" label="reports.filters.parametric">
                <input id="parametric" class="form-control" type="number" v-model="v$.form.parametric.$model" />
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
                  <th class="col-3">Subárea</th>
                  <th class="text-center">Total alumnos aprobados</th>
                  <th class="text-center">Total alumnos reprobados</th>
                  <th class="text-center">Total alumnos</th>
                  <th class="text-center">Porcentaje de alumnos aprobados</th>
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
                </tr>
              </tbody>
            </table>

            <hr />

            <h5>Lista de Alumnos Reprobados</h5>

            <table class="table">
              <thead>
                <tr>
                  <th>Nombre alumno</th>
                  <th>Subárea</th>
                  <th class="text-center">Punteo</th>
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
import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Bar } from 'vue-chartjs';

import FilterPeriods from '../components/FilterPeriods.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import FilterShowFields from '../components/FilterShowFields.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterSubjectClassification from '../components/FilterSubjectClassification.vue';
import FilterAcademicPeriodWithGroups from '../components/FilterAcademicPeriodWithGroups.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { IGetFiltersPerformanceStatisticsByGroupService } from '../services/filters/getFiltersPerformanceStatisticsByGroup.service';

import { GetFiltersPerformanceStatisticsByGroupService } from '../services/filters/getFiltersPerformanceStatisticsByGroup.service';
import { GenerateReportPerformanceStatisticsByGroupWithGraphService } from '../services/reports/generateReportPerformanceStatisticsByGroupWithGraph.service';
import { useHeaderStore } from '../../../stores/header.store';

const generateReportPerformanceStatisticsByGroupWithGraphService = new GenerateReportPerformanceStatisticsByGroupWithGraphService();
const getFiltersPerformanceStatisticsByGroupService = new GetFiltersPerformanceStatisticsByGroupService();

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default defineComponent({
  name: 'PerformanceStatisticsByGroupGraph',
  components: {
    FilterAcademicPeriodWithGroups,
    FilterStudentClassification,
    FilterSubjectClassification,
    AppEmptyResponse,
    FilterShowFields,
    AppButtonBack,
    FilterPeriods,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppCard,
    Bar,
  },

  setup() {
    const title = 'reports.performanceStatisticsByGroupWithGraph';
    const permission = 'reports.performanceStatisticsByGroupWithGraph';
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

    const filters = ref<IGetFiltersPerformanceStatisticsByGroupService>({
      subjectCategories: [],
      studentCategories: [],
      academicPeriods: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      periodId: null,
      studentCategories: [],
      subjectCategories: [],
      itemCode: permission,
      parametric: null,
      showFields: [],
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          periodId: { required },
          studentCategories: {},
          subjectCategories: {},
          itemCode: { required },
          parametric: { required },
          showFields: { required },
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodGroupId: form.academicPeriodGroupId,
      periodId: form.periodId,
      subjectCategoriesIds: form.subjectCategories,
      studentCategoriesIds: form.studentCategories,
      parametric: form.parametric,
      options: form.showFields,
    }));

    const chartData = computed(() => ({
      labels: dataGraph.value.labels,
      datasets: [
        {
          label: 'Desempeño por grupo',
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

      filters.value = await getFiltersPerformanceStatisticsByGroupService.run();

      loading.value = false;
    });

    const generate = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      loadingGenerate.value = true;
      dataGraph.value = null;

      try {
        const response = await generateReportPerformanceStatisticsByGroupWithGraphService.run(params.value);
        dataTable1.value = response.table1;
        dataTable2.value = response.table2 ?? [];
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
      chartData,
      dataGraph,
      filters,

      generate,
    };
  },
});
</script>

<style scoped></style>
