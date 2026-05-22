<template>
  <BaseLayoutDevelopmentMaps title="Informe consolidado por estado">
    <template #actions>
      <AppButtonBack :to="{ name: 'public.generateReportConsolidated' }" />
    </template>

    <template #content>
      <div class="Table__content">
        <AppLoading v-if="loading"></AppLoading>

        <table class="Content__dataTable">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Correo Electronico</th>
              <th>Programa</th>
              <th>Cluster</th>
              <th>Id del Modulo</th>
              <th>Titulo del Modulo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in dataReport" :key="index">
              <td>{{ report.user }}</td>
              <td>{{ report.names }}</td>
              <td>{{ report.lastnames }}</td>
              <td>{{ report.email }}</td>
              <td>{{ report.courseCode }}</td>
              <td>{{ report.courseName }}</td>
              <td>{{ report.CurriculumSubjectId }}</td>
              <td>{{ report.degreeName }}</td>
              <td>
                <router-link :to="{ name: 'public.reportConsolidated' }">
                  {{ report.users }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </BaseLayoutDevelopmentMaps>

  <div class="GenerateReport">
    <div class="GenerateReport__img">
      <img src="../../../../assets/images/image-header-develop-map.png" alt="Image header" />
    </div>
    <div class="GenerateReport__title d-flex justify-content-between align-items-center">
      <h2>Informe consolidado por estado</h2>
      <AppButtonBack :to="{ name: 'public.generateReportConsolidated' }" />
    </div>
    <div class="GenerateReport__table">
      <div class="Table__content">
        <AppLoading v-if="loading"></AppLoading>
        <table class="Content__dataTable">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Correo Electronico</th>
              <th>Programa</th>
              <th>Cluster</th>
              <th>Id del Modulo</th>
              <th>Titulo del Modulo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in dataReport" :key="index">
              <td>{{ report.user }}</td>
              <td>{{ report.names }}</td>
              <td>{{ report.lastnames }}</td>
              <td>{{ report.email }}</td>
              <td>{{ report.courseCode }}</td>
              <td>{{ report.courseName }}</td>
              <td>{{ report.CurriculumSubjectId }}</td>
              <td>{{ report.degreeName }}</td>
              <td>
                <router-link :to="{ name: 'public.reportConsolidated' }">
                  {{ report.users }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import BaseLayoutDevelopmentMaps from '../../components/BaseLayoutDevelopmentMaps.vue';
import AppButtonBack from '../../../../shared/components/Buttons/AppButtonBack.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';
import { GetDataThirdReportDetailedService } from '../../services/organizational/getOrganizationalThirdReportDetailed.service';

const getDataThirdReportDetailedService = new GetDataThirdReportDetailedService();

export default defineComponent({
  name: 'generateReportConsolidated',
  components: {
    AppLoading,
    AppButtonBack,
    BaseLayoutDevelopmentMaps,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Reporte';
    const routes = [
      {
        name: 'Estructura organizacional',
        url: { name: 'organizational.organizationalStructure' },
      },
      {
        name: title,
      },
    ];
    useMeta({ title: t(title) });
    const dataReport = ref<any>();
    const curriculumSubjectId = ref<any>();
    const status = ref<any>();
    const loading = ref(true);
    onMounted(async () => {
      try {
        dataReport.value = await getDataThirdReportDetailedService.run(1241, status.value);
        console.log('este es un mensjae de emergencia baby', dataReport.value);
        console.log('ides', curriculumSubjectId.value);
        console.log('estados', status.value);
        loading.value = false;
      } catch (error) {
        console.log('this error onmounted', error);
        loading.value = false;
      }
    });

    return {
      title,
      routes,
      loading,
      curriculumSubjectId,
      status,
      dataReport,
    };
  },
});
</script>
<style>
.GenerateReport {
  display: flex;
  flex-direction: column;
  padding: var(--padding-5);
}

.GenerateReport__img {
  height: 120px;
  position: sticky;
  z-index: -1;
  overflow: hidden;
}

.GenerateReport__img img {
  width: 100%;
}

.GenerateReport__title {
  font-style: italic;
  background: #fff;
}

.GenerateReport__table {
  background: #fff;
}
.Content__dataTable {
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  min-width: 100%;
  border-radius: 5px 5px 0 0;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.Content__dataTable thead tr {
  background-color: var(--color-primary);
  color: #ffffff;
  text-align: left;
  font-weight: bold;
}

.Content__dataTable th,
.Content__dataTable td {
  padding: 12px 15px;
}

.Content__dataTable tbody tr {
  border-bottom: 1px solid #dddddd;
}

.Content__dataTable tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.Content__dataTable tbody tr:last-of-type {
  border-bottom: 2px solid var(--color-primary);
}

.Table__content {
  height: 60vh;
  overflow-y: scroll;
}

.Table__content::-webkit-scrollbar {
  width: 0.1rem;
}
.Table__content::-webkit-scrollbar-track {
  background: transparent;
}
.Table__content::-webkit-scrollbar-thumb {
  border-radius: 20px;
  border: none;
}
</style>
