<template>
  <BaseLayoutDevelopmentMaps :title="`Reporte Detallado de Avances ${profileCode !== 'student' ? 'por Colaborador' : ''}`">
    <template #actions>
      <AppButtonBack
        v-if="profileCode !== 'student'"
        class="me-2"
        :to="{
          name: 'public.DevelopmentMapsMainBanner',
          query: { employeeId },
        }"
      />
      <AppButtonBack v-else class="me-2" :to="{ name: 'public.DevelopmentMapsMainBanner' }" />

      <AppButton v-if="profileCode !== 'student'" label="Generar" @click="generateReport" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <section v-if="profileCode !== 'student'" class="form-row">
          <AppFormField label="Area">
            <AppAutocomplete v-model="organizationalUnitId" :options="organizationalUnits" />
          </AppFormField>

          <AppFormField label="Puesto">
            <AppAutocomplete v-model="organizationalJobId" :options="organizationalJobs" />
          </AppFormField>

          <AppFormField label="Colaborador">
            <AppAutocomplete v-model="currentEmployeeId" :options="employees" label="employee" />
          </AppFormField>
        </section>

        <div class="Table__content">
          <AppLoading v-if="loadingReport" />

          <table v-else-if="!loadingReport && showTable" class="Content__dataTable">
            <thead>
              <tr>
                <th>DKC</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Area</th>
                <th>Puesto</th>
                <th>Curso</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="!dataReport.length">
                <tr>
                  <td class="text-center" colspan="7">No se encontraron registros</td>
                </tr>
              </template>

              <tr v-for="(report, index) in dataReport" :key="index">
                <td>{{ report.userToken }}</td>
                <td>{{ report.names }}</td>
                <td>{{ report.lastnames }}</td>
                <td>{{ report.organizationalUnit }}</td>
                <td>{{ report.organizationalJob }}</td>
                <td>{{ report.course }}</td>
                <td>{{ report.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
  </BaseLayoutDevelopmentMaps>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../../shared/components/AppLoading.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import BaseLayoutDevelopmentMaps from '../../components/BaseLayoutDevelopmentMaps.vue';

import { RolesService } from '../../../../shared/services/roles.service';
import { GetDataDetailedReportService } from '../../services/organizational/getDataDetailedReport.service';
import { GetDevelopmentMapRelatedDataService } from '../../services/organizational/getDevelopmentMapRelatedData.service';

const getDevelopmentMapRelatedDataService = new GetDevelopmentMapRelatedDataService();
const getDataDetailedReportService = new GetDataDetailedReportService();
const rolesService = new RolesService();

export default defineComponent({
  name: 'generateGeneralReportByCollaborator',

  components: {
    BaseLayoutDevelopmentMaps,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppLoading,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    useMeta({ title: t('Estructura organizacional') });

    const selectedRole = rolesService.getSelectedRole();
    const profileCode = selectedRole ? selectedRole.profile.code : null;

    const organizationalUnitId: Ref<number | null> = ref(route.query.organizationalUnitId ? Number(route.query.organizationalUnitId) : null);
    const organizationalJobId: Ref<number | null> = ref(route.query.organizationalJobId ? Number(route.query.organizationalJobId) : null);
    const employeeId: Ref<number> = ref(Number(route.params.employeeId));
    const currentEmployeeId: Ref<number | null> = ref(null);

    const organizationalUnits: Ref<any[]> = ref([]);
    const organizationalJobs: Ref<any[]> = ref([]);
    const dataReport: Ref<any[]> = ref([]);
    const employees: Ref<any[]> = ref([]);

    const loadingReport = ref(false);
    const loadingData = ref(true);
    const showTable = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        if (profileCode !== 'student') await getRelatedData();
        else await generateReport();
      } catch (error) {
        console.log('this error onmounted', error);
        loading.value = false;
      }

      loading.value = false;
    });

    watch(organizationalUnitId, async () => {
      organizationalJobId.value = null;

      await getRelatedData();
    });
    watch(organizationalJobId, async () => {
      await getRelatedData();
    });

    const getRelatedData = async () => {
      loadingData.value = true;

      try {
        const params = {
          employeeId: employeeId.value,
          organizationalJobId: organizationalJobId.value,
          organizationalUnitId: organizationalUnitId.value,
        };

        const response = await getDevelopmentMapRelatedDataService.run(params);

        organizationalUnits.value = response.organizationalUnits;
        organizationalJobs.value = response.organizationalJobs;
        employees.value = response.employees;
      } catch (err) {
        console.log('this error getRelatedData', err);
        loadingData.value = false;
      }

      loadingData.value = false;
    };

    const generateReport = async () => {
      try {
        loadingReport.value = true;
        showTable.value = true;

        const params = {
          employeeId: profileCode === 'student' ? employeeId.value : currentEmployeeId.value,
          organizationalJobId: organizationalJobId.value,
          organizationalUnitId: organizationalUnitId.value,
        };

        dataReport.value = await getDataDetailedReportService.run(params);
      } catch (err) {
        console.log('err', err);
        loadingReport.value = false;
      }

      loadingReport.value = false;
    };
    return {
      loadingReport,
      profileCode,
      showTable,
      loading,

      organizationalUnitId,
      organizationalUnits,
      organizationalJobId,
      organizationalJobs,
      currentEmployeeId,
      dataReport,
      employeeId,
      employees,

      generateReport,
    };
  },
});
</script>

<style scoped>
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
.Table__filters {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: var(--gap-3);
  align-items: center;
}
.Filters__area,
.Filters__puesto,
.Filters__collaborator {
  width: 35%;
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
