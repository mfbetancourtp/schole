<template>
  <AppDatatable :name="name" :service="service" :params="params">
    <template v-slot:filters>
      <AppFilter v-model="status" :filter-name="`${name}.status`">
        <label>{{ t('reports.filters.status') }}</label>

        <AppAutocomplete v-model="status" :options="filters.status" :reduce="(d: any) => d.value"></AppAutocomplete>
      </AppFilter>

      <AppFilter v-model="degreeId" :filter-name="`${name}.degreeId`">
        <label>{{ t('academicPrograms.degrees.singular') }}</label>

        <AppAutocomplete v-model="degreeId" :options="filters.degrees"></AppAutocomplete>
      </AppFilter>

      <AppFilter v-model="productId" :filter-name="`${name}.productId`">
        <label>{{ t('Conceptos') }}</label>

        <AppAutocomplete v-model="productId" :options="filters.products" :reduce="(d: any) => d.productId" label="title"> </AppAutocomplete>
      </AppFilter>
    </template>

    <AppDatatableColumn label="Identificación" field="identification" :sortable="true" v-slot="{ row }">
      {{ row.people.identification }}
    </AppDatatableColumn>

    <AppDatatableColumn label="Nombre Aspirante" field="name" :sortable="true" v-slot="{ row }"> {{ row.people.lastnames }} {{ row.people.names }} </AppDatatableColumn>

    <AppDatatableColumn label="Grado" field="degreeName" :sortable="true" v-slot="{ row }">
      {{ row.degreeName }}
    </AppDatatableColumn>

    <AppDatatableColumn label="# Recibo" field="invoice" :sortable="true" v-slot="{ row }">
      {{ row.invoiceId }}
    </AppDatatableColumn>

    <AppDatatableColumn label="# Conceptos" field="quantity" :sortable="true" v-slot="{ row }">
      {{ row.quantity }}
    </AppDatatableColumn>

    <AppDatatableColumn label="# Descuentos" field="quantity" :sortable="true" v-slot="{ row }">
      {{ row.quantityDiscounts }}
    </AppDatatableColumn>

    <AppDatatableColumn label="Medio de Pago" field="invoice" :sortable="true" v-slot="{ row }">
      {{ getTypePaymentLabel(row) }}
    </AppDatatableColumn>

    <AppDatatableColumn label="Estado" field="status" :sortable="true" v-slot="{ row }">
      {{ getStatusLabel(row) }}
    </AppDatatableColumn>

    <AppDatatableColumn v-slot="{ row }">
      <AppButtonGroup>
        <AppButtonEdit
          v-if="row.isQuote"
          :to="{
            name: 'surveys.editInvoice',
            params: {
              convocationId: convocationId,
              convocationStepId: convocationStepId,
              invoiceId: row.invoiceId,
            },
            query: {
              convocationEnrolStepId: row.id,
              convocationTitle: convocationTitle,
              stepType: stepType,
              convocationStepTitle: convocationStepTitle,
            },
          }"
        ></AppButtonEdit>

        <AppButton :disabled="!row.paymentId" v-tooltip="'Ver Recibo'" @click="openInscritoDetailsModal(row.id, row.invoiceId, row)" icon="file-invoice-dollar" variant="primary" outlined> </AppButton>
        <AppButton
          v-if="row.urlProofOfPayment != null"
          :disabled="!row.paymentId"
          v-tooltip="'Ver Comprobante'"
          icon="eye"
          :size="'sm'"
          outlined
          :href="row.urlProofOfPayment"
          class="tw-line-clamp-3"
          target="_blank"
        ></AppButton>

        <AppButton :disabled="!row.requiresApproval" v-tooltip="'Aprobar Inscripción'" @click="approveOrReject(1, row.id, row.rejectedObservations)" variant="primary" icon="thumbs-up" outlined>
        </AppButton>

        <AppButton :disabled="!row.requiresApproval" v-tooltip="'Rechazar Inscripción'" @click="approveOrReject(0, row.id, row.rejectedObservations)" variant="primary" icon="thumbs-down" outlined>
        </AppButton>
      </AppButtonGroup>
    </AppDatatableColumn>
  </AppDatatable>
  <div class="mt-3 d-flex flex-row-reverse">
    <AppButton variant="primary" @click="downloadExcel()" label="Exportar datos a excel"></AppButton>
  </div>

  <AppModal v-model="rejectedObservationsModal">
    <RejectedObservations v-if="rejectedObservationsModal" :data="currentData" @close="closeApproveOrRejectModal"> </RejectedObservations>
  </AppModal>

  <AppModal v-model="inscritoDetailsModal" :size="'lg'">
    <InscritoDetailsCobro
      v-if="inscritoDetailsModal"
      :name="invoiceId"
      :convocationEnrolStepId="currentConvocationEnrolStepId"
      :payment-method="methodsPaymentsProps"
      @close="closeInscritoDetailsModal"
    ></InscritoDetailsCobro>
  </AppModal>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { computed, defineComponent, onMounted, ref } from 'vue';

import RejectedObservations from './RejectedObservations.vue';
import InscritoDetailsCobro from './InscritoDetailsCobro.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { UpdateApprovedByInscritoService } from '../services/updateApprovedByInscrito.service';
import { GetDownloadExcelService } from '../services/getDownloadExcel.service';

const updateDatatableService = new UpdateDatatableService();
const updateApprovedByInscritoService = new UpdateApprovedByInscritoService();
const getDownloadExcelService = new GetDownloadExcelService();

export default defineComponent({
  name: 'InscritosStepCobro',
  components: {
    RejectedObservations,
    InscritoDetailsCobro,
    AppDatatableColumn,
    AppAutocomplete,
    AppButtonGroup,
    AppButtonEdit,
    AppDatatable,
    AppFilter,
    AppButton,
    AppModal,
  },

  props: ['service', 'convocationStepId', 'filters', 'convocationTitle', 'stepType', 'convocationStepTitle'],

  setup(props) {
    const { t } = useI18n();
    const name = 'inscritosStepForm';

    const rejectedObservationsModal = ref(false);
    const currentConvocationEnrolStepId = ref();
    const inscritoDetailsModal = ref(false);
    const convocationId = ref();
    const currentData = ref();
    const route = useRoute();
    const productId = ref();
    const invoiceId = ref();
    const degreeId = ref();
    const status = ref();
    const methodsPaymentsProps = ref<any>();

    onMounted(async () => {
      try {
        convocationId.value = parseInt(route.params.convocationId.toString(), 10);
      } catch (e) {
        console.log(e);
      }
    });
    const params = computed(() => {
      return {
        convocationStepId: props.convocationStepId,
        productId: productId.value,
        degreeId: degreeId.value,
        status: status.value,
      };
    });

    const approveOrReject = async (isApproved: number, id: number, rejectedObservations: string) => {
      let data = {
        id: id,
        isApproved: isApproved,
        rejectedObservations: rejectedObservations,
      };

      if (isApproved) {
        try {
          await updateApprovedByInscritoService.run(data);
          updateDatatableService.run();
        } catch (e) {
          console.log(e);
        }
      } else {
        currentData.value = data;
        rejectedObservationsModal.value = true;
      }
    };
    const closeApproveOrRejectModal = async () => {
      rejectedObservationsModal.value = false;
      updateDatatableService.run();
    };

    const openInscritoDetailsModal = async (convocationEnrolStepId: number, name: string, row: any) => {
      currentConvocationEnrolStepId.value = convocationEnrolStepId;
      invoiceId.value = name;

      inscritoDetailsModal.value = true;

      await getTypePayment(row);
    };
    const closeInscritoDetailsModal = () => {
      inscritoDetailsModal.value = false;
    };

    const downloadExcel = async () => {
      const detailData = await getDownloadExcelService.run({
        convocationStepId: props.convocationStepId,
      });
      window.location.href = detailData.file;
    };
    const getStatusLabel = (row: any) => {
      if (!row.requiresApproval) {
        return row.isApproved == null ? 'Pendiente' : 'Finalizado';
      } else {
        if (row.isApproved == null) {
          return 'En revisión';
        } else if (row.isApproved == 0) {
          return 'Detenido';
        } else if (row.isApproved == 1) {
          return 'Aprobado';
        } else if (row.isApproved == 2) {
          return 'Finalizado';
        }
      }
    };
    const getTypePayment = (row: any) => {
      if (row && row.paymentType === null) {
        methodsPaymentsProps.value = 0;
      } else if (row && row.paymentType === 'WebCheckout') {
        methodsPaymentsProps.value = 1;
      } else if (row && row.paymentType === 'Efectivo') {
        methodsPaymentsProps.value = 2;
      }
    };

    const getTypePaymentLabel = (row: any) => {
      if (row && row.paymentType === null) {
        return 'Pague A Tiempo';
      } else if (row && row.paymentType === 'WebCheckout') {
        return 'WebCheckout';
      } else if (row && row.paymentType === 'Efectivo') {
        return 'Efectivo';
      }
    };
    return {
      productId,
      degreeId,
      status,
      params,
      name,
      t,

      currentConvocationEnrolStepId,
      rejectedObservationsModal,
      inscritoDetailsModal,
      convocationId,
      currentData,
      invoiceId,

      closeApproveOrRejectModal,
      openInscritoDetailsModal,
      closeInscritoDetailsModal,
      approveOrReject,
      downloadExcel,
      getStatusLabel,
      getTypePayment,
      methodsPaymentsProps,
      getTypePaymentLabel,
    };
  },
});
</script>

<style scoped></style>
