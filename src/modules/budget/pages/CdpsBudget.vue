<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'budget.expenseExecution' }" />
    </template>
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <AppDatatable :service="service" :name="name" :params="params">
          <AppDatatableColumn label="Código del reporte" field="codeReport" :sortable="true" v-slot="{ row }">
            {{ row.codeReport }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Concepto" field="concept" :sortable="true" v-slot="{ row }">
            {{ row.concept }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Valor" field="value" :sortable="true" v-slot="{ row }">
            {{ row.value }}
          </AppDatatableColumn>
          <AppDatatableColumn label="core.businessName" field="businessName" :sortable="true" v-slot="{ row }">
            {{ row.businessName }}
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }" :label="'CDP'" :position="'centered'">
            <AppButtonGroup size="sm">
              <AppButton icon="eye" v-tooltip="t('core.seeDetail')" @click="openDetailCdpAndRpModal(row)"> </AppButton>
              <AppButton icon="file-invoice-dollar" v-tooltip="t('core.download')" @click="downloadReport(row.urlCdt)"> </AppButton>
            </AppButtonGroup>
          </AppDatatableColumn>
          <AppDatatableColumn v-slot="{ row }" :label="'RP'" :position="'centered'">
            <AppButton v-if="row.urlBudgetRecordInitial" icon="file-contract" v-tooltip="t('core.download')" @click="downloadReport(row.urlBudgetRecordInitial)"></AppButton>
            <AppButton v-else icon="plus" v-tooltip="t('core.new')" @click="openModalCreateRp(row)"></AppButton>
          </AppDatatableColumn>
          <AppDatatableColumn v-slot="{ row }" :label="'reports.preContract'" :position="'centered'">
            <AppButton v-if="row.dataPreContract.id" icon="file-contract" v-tooltip="t('core.download')" @click="downloadReport(row.urlBudgetRecordInitial)"></AppButton>
            <AppButton v-else icon="plus" v-tooltip="t('core.new')" @click="openModalCreatePrecontract(row)" :disabled="false"></AppButton>
          </AppDatatableColumn>
          <AppDatatableColumn v-slot="{ row }" :label="'reports.filters.status'" :position="'centered'">
            <div>
              <span
                :style="{
                  backgroundColor: getStatusColor(row.statusId),
                }"
                class="badge-status"
              >
                {{ getStatus(row.statusId) }}
              </span>
            </div>
          </AppDatatableColumn>
        </AppDatatable>
      </template>
      <AppModal v-model="modalCreateRp" :size="'lg'">
        <FirstRpForm v-if="modalCreateRp" :data="dataCreateRp" @close="closeModalCreateRp"> </FirstRpForm>
      </AppModal>
      <AppModal v-model="modalDetailCdpAndRp" :size="'lg'">
        <DetailCdpAndRpModal v-if="modalDetailCdpAndRp" :data="dataDetailCdpAndRp" :contractsStates="contractsStates" @close="closeModalDetailCdpAndRp" @update="refreshData(false)">
        </DetailCdpAndRpModal>
      </AppModal>
      <AppModal v-model="modalCreatePrecontract" :size="'lg'">
        <PrecontractForm v-if="modalCreatePrecontract" :data="dataCreatePrecontract" @close="closeModalCreatePrecontract"></PrecontractForm>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { computed, defineComponent, onMounted, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import FirstRpForm from '../components/FirstRpForm.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import DetailCdpAndRpModal from '../components/DetailCdpAndRpModal.vue';
import PrecontractForm from '../components/PrecontractForm.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetReportStoreActionsCdpService } from '../services/getReportStoreActionsCdp.service';
import { GetContractsStatesService } from '../services/getContractsStates.service';

const updateDatatableService = new UpdateDatatableService();
const getContractsStatesService = new GetContractsStatesService();

export default defineComponent({
  name: 'CdpsBudgetPage',
  components: {
    AppButtonGroup,
    AppDatatableColumn,
    AppModal,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppButton,
    AppButtonBack,
    FirstRpForm,
    DetailCdpAndRpModal,
    PrecontractForm,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Reporte de Certificado de Disponibilidad Presupuestal';
    const name = 'Report de Certificado de Disponibilidad Presupuestal';
    const route = useRoute();
    const service = new GetReportStoreActionsCdpService();

    const modalCreateRp = ref(false);
    const dataCreateRp = ref();
    const contractsStates = ref([]);

    const modalDetailCdpAndRp = ref(false);
    const dataDetailCdpAndRp = ref();

    const modalCreatePrecontract = ref(false);
    const dataCreatePrecontract = ref();

    const refreshData = (shouldDelay = true) => {
      if (shouldDelay) {
        setTimeout(async () => {
          updateDatatableService.run();
        }, 1000);
      } else {
        updateDatatableService.run();
      }
    };

    useMeta({
      title: t(title),
    });
    const executionOfExpenseId = parseInt(route.params.executionOfExpenseId as string);
    const loading = ref(true);
    const params = computed(() => {
      return {
        executionOfExpenseId: executionOfExpenseId,
      };
    });
    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Presupuesto', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        contractsStates.value = await getContractsStatesService.run();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const downloadReport = async (url: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', obtenerNombreArchivoDesdeUrl(url));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.error('Error al descargar el archivo:', error);
      }
    };

    const obtenerNombreArchivoDesdeUrl = (url: string): string => {
      return url.split('/').pop() || 'report.pdf';
    };

    const openModalCreateRp = (row: any) => {
      modalCreateRp.value = true;
      dataCreateRp.value = row;
    };
    const closeModalCreateRp = () => {
      modalCreateRp.value = false;
      dataCreateRp.value = null;
      refreshData();
    };
    const openDetailCdpAndRpModal = (row: any) => {
      modalDetailCdpAndRp.value = true;
      dataDetailCdpAndRp.value = row;
    };
    const closeModalDetailCdpAndRp = () => {
      modalDetailCdpAndRp.value = false;
      dataDetailCdpAndRp.value = null;
    };
    const openModalCreatePrecontract = (row: any) => {
      modalCreatePrecontract.value = true;
      dataCreatePrecontract.value = row;
    };
    const closeModalCreatePrecontract = () => {
      modalCreatePrecontract.value = false;
      dataCreatePrecontract.value = null;
      refreshData();
    };

    const getStatus = (statusId: string) => {
      const statusObject: any = contractsStates.value.find((item: any) => item.label === statusId);
      return statusObject ? statusObject.value : statusId;
    };
    const getStatusColor = (statusId: string): string => {
      const colorMap: Record<string, string> = {
        '0': '#6B7280', // gris
        '1': '#2563EB', // azul
        '2': '#DC2626', // rojo
        '3': '#16A34A', // verde
      };
      console.log(colorMap[statusId], statusId);
      return colorMap[statusId] ?? '#D1D5DB'; // gris claro por defecto
    };

    return {
      loading,
      title,
      t,
      service,
      name,
      params,
      downloadReport,
      openModalCreateRp,
      closeModalCreateRp,
      modalCreateRp,
      dataCreateRp,
      contractsStates,
      getStatus,
      getStatusColor,
      modalDetailCdpAndRp,
      dataDetailCdpAndRp,
      openDetailCdpAndRpModal,
      closeModalDetailCdpAndRp,
      refreshData,
      dataCreatePrecontract,
      modalCreatePrecontract,
      openModalCreatePrecontract,
      closeModalCreatePrecontract,
    };
  },
});
</script>

<style scoped>
.badge-status {
  color: white;
  padding: 0.3rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
  min-width: 6rem;
  text-align: center;
}
</style>
