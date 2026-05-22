<template>
  <BaseLayoutDevelopmentMaps :title="title">
    <template #actions>
      <AppButtonBack
        :to="{
          name: 'public.DevelopmentMapsMainBanner',
          query: { employeeId },
        }"
      />

      <AppButton class="ms-2" label="reports.btnGenerate" @click="generateReport" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <section class="form-row">
          <AppFormField label="Area">
            <AppAutocomplete v-model="organizationalUnitId" :options="organizationalUnits" />
          </AppFormField>

          <AppFormField label="Puesto">
            <template v-if="loadingFilter">
              <AppProgressBar />
              <AppAutocomplete :options="[]" disabled />
            </template>

            <template v-else>
              <AppAutocomplete v-model="organizationalJobId" :options="organizationalJobs" />
            </template>
          </AppFormField>

          <AppFormField label="Estado">
            <AppAutocomplete v-model="status" :options="inscriptionStatus" multiple />
          </AppFormField>
        </section>

        <AppLoading v-if="loadingReport" />

        <template v-else-if="!loadingReport && showTable && dataReport">
          <div class="Table__content">
            <table class="Content__dataTable">
              <thead>
                <tr>
                  <th>Cluster</th>
                  <th>módulo</th>
                  <th>Código de módulo</th>

                  <template v-for="(status, index) in dataReport.uniqueStatus" :key="index">
                    <th class="text-center">{{ status }}</th>
                  </template>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in dataReport.data" :key="index">
                  <td>{{ item.cluster }}</td>
                  <td>{{ item.module }}</td>
                  <td>{{ item.module_code }}</td>

                  <template v-for="(status, index) in dataReport.uniqueStatus" :key="index">
                    <td class="text-center">{{ item[status] }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>
    </template>
  </BaseLayoutDevelopmentMaps>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../../shared/components/AppLoading.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppProgressBar from '../../../../shared/components/AppProgressBar.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import BaseLayoutDevelopmentMaps from '../../components/BaseLayoutDevelopmentMaps.vue';

import { GetDataOrganizationalThirdReportService } from '../../services/organizational/getOrganizationalThirdReport.service';
import { GetThirdDevelopmentMapReportByParamsService } from '../../services/organizational/getThirdDevelopmentMapReportByParams.service';

const getThirdDevelopmentMapReportByParamsService = new GetThirdDevelopmentMapReportByParamsService();
const getDataOrganizationalThirdReportService = new GetDataOrganizationalThirdReportService();

export default defineComponent({
  name: 'generateReportConsolidated',

  components: {
    BaseLayoutDevelopmentMaps,
    AppAutocomplete,
    AppProgressBar,
    AppButtonBack,
    AppFormField,
    AppLoading,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const employeeId = route.params.employeeId;
    const title = 'Informe consolidado por estado';

    useMeta({ title: t(title) });

    const organizationalUnits: Ref<any[]> = ref([]);
    const organizationalJobs: Ref<any[]> = ref([]);
    const inscriptionStatus: Ref<any[]> = ref([]);

    const organizationalUnitId: Ref<number | null> = ref(null);
    const organizationalJobId: Ref<number | null> = ref(null);
    const status: Ref<string[] | null> = ref(null);
    const dataReport: Ref<any> = ref(null);

    const loadingFilter = ref(false);
    const loadingReport = ref(false);
    const showTable = ref(false);
    const loading = ref(true);

    const params = computed(() => {
      const params: any = { employeeId };

      if (organizationalUnitId.value) params.organizationalUnitId = organizationalUnitId.value;
      if (organizationalJobId.value) params.organizationalJobId = organizationalJobId.value;
      if (status.value) params.status = status.value;

      return params;
    });

    onMounted(async () => {
      try {
        await getData();
      } catch (e) {
        console.log('this error onmounted', e);
      }

      loading.value = false;
    });

    watch(organizationalUnitId, async () => await getData());

    const getData = async () => {
      loadingFilter.value = true;

      const response = await getDataOrganizationalThirdReportService.run(params.value);

      organizationalJobs.value = response.organizationalJobs;
      organizationalJobId.value = null;

      if (!organizationalUnits.value.length) organizationalUnits.value = response.organizationalUnits;

      if (!inscriptionStatus.value.length) {
        inscriptionStatus.value = response.courseInscriptionStatus.map((item: any) => {
          return { id: item.value, name: item.value };
        });
      }

      loadingFilter.value = false;
    };

    const generateReport = async () => {
      try {
        loadingReport.value = true;
        showTable.value = true;

        dataReport.value = await getThirdDevelopmentMapReportByParamsService.run(params.value);
      } catch (e) {
        console.log('err', e);
      }

      loadingReport.value = false;
    };
    return {
      loadingFilter,
      employeeId,
      loading,
      title,
      t,

      organizationalUnitId,
      organizationalUnits,
      organizationalJobId,
      organizationalJobs,
      inscriptionStatus,
      loadingReport,
      dataReport,
      showTable,
      status,

      generateReport,
    };
  },
});
</script>

<style scoped>
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
