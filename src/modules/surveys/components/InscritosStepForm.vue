<template>
  <AppDatatable :name="name" :service="service" :params="params">
    <template v-slot:filters>
      <AppFilter v-model="status" :filter-name="`${name}.status`">
        <label>{{ t('reports.filters.status') }}</label>

        <AppAutocomplete v-model="status" :options="filters.status" :reduce="(d: any) => d.value" />
      </AppFilter>

      <AppFilter v-model="degreeId" :filter-name="`${name}.degreeId`">
        <label>{{ t('academicPrograms.degrees.singular') }}</label>

        <AppAutocomplete v-model="degreeId" :options="filters.degrees" />
      </AppFilter>
    </template>

    <AppDatatableColumn label="Identificación" field="identification" v-slot="{ row }">
      {{ row.people.identification }}
    </AppDatatableColumn>

    <AppDatatableColumn label="Nombre Aspirante" field="name" v-slot="{ row }"> {{ row.people.lastnames }} {{ row.people.names }} </AppDatatableColumn>

    <AppDatatableColumn label="Grado" field="degreeName" v-slot="{ row }">
      {{ row.degreeName }}
    </AppDatatableColumn>

    <AppDatatableColumn label="Celular" field="mobile" v-slot="{ row }">
      {{ row.people.mobile }}
    </AppDatatableColumn>

    <AppDatatableColumn label="Email" field="email" v-slot="{ row }">
      {{ row.people.email }}
    </AppDatatableColumn>

    <AppDatatableColumn label="Estado" field="status" v-slot="{ row }">
      {{ getStatusLabel(row) }}
    </AppDatatableColumn>

    <AppDatatableColumn v-slot="{ row }">
      <AppButtonGroup>
        <AppButton icon="file-alt" v-tooltip="'Ver Formulario'" @click="openInscritoDetailsModal(row.id, `${row.people.names} ${row.people.lastnames}`)" />

        <AppButton icon="thumbs-up" v-tooltip="'Aprobar Inscripción'" :disabled="!row.requiresApproval" @click="approveOrReject(1, row.id, row.rejectedObservations)" />

        <AppButton icon="thumbs-down" v-tooltip="'Rechazar Inscripción'" :disabled="!row.requiresApproval" @click="approveOrReject(0, row.id, row.rejectedObservations)" />
      </AppButtonGroup>
    </AppDatatableColumn>
  </AppDatatable>

  <div class="mt-3 d-flex flex-row-reverse">
    <AppButton variant="primary" @click="serviceExcel()" label="Exportar datos a excel" />
  </div>

  <AppModal v-model="rejectedObservationsModal">
    <RejectedObservations v-if="rejectedObservationsModal" :data="currentData" @close="closeApproveOrRejectModal" />
  </AppModal>

  <AppModal v-model="inscritoDetailsModal" :size="'lg'">
    <InscritoDetails v-if="inscritoDetailsModal" :name="userName" :convocationEnrolStepId="currentConvocationEnrolStepId" />
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import exportFromJSON from 'export-from-json';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import InscritoDetails from './InscritoDetails.vue';
import RejectedObservations from './RejectedObservations.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { GetExportExcel } from '../services/getExportExcel.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { UpdateApprovedByInscritoService } from '../services/updateApprovedByInscrito.service';

const updateApprovedByInscritoService = new UpdateApprovedByInscritoService();
const updateDatatableService = new UpdateDatatableService();
const getExportExcel = new GetExportExcel();

export default defineComponent({
  name: 'InscritosStepForm',

  components: {
    RejectedObservations,
    AppDatatableColumn,
    AppAutocomplete,
    InscritoDetails,
    AppButtonGroup,
    AppDatatable,
    AppFilter,
    AppButton,
    AppModal,
  },

  props: ['service', 'convocationStepId', 'filters'],

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const name = 'inscritosStepForm';

    const currentConvocationEnrolStepId = ref();
    const currentData = ref();
    const degreeId = ref();
    const userName = ref();
    const status = ref();

    const rejectedObservationsModal = ref(false);
    const inscritoDetailsModal = ref(false);

    const params = computed(() => {
      return {
        convocationStepId: props.convocationStepId,
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

    const openInscritoDetailsModal = (convocationEnrolStepId: number, name: string) => {
      currentConvocationEnrolStepId.value = convocationEnrolStepId;
      userName.value = name;

      inscritoDetailsModal.value = true;
    };

    const downloadExcel = async () => {
      const service = props.service;

      const detailData = await service.run({
        convocationStepId: props.convocationStepId,
      });
      const exportType = exportFromJSON.types.xls;
      const fileName = 'download';
      let data: any[] = [];

      detailData.data.forEach((row: any) => {
        data.push({
          Identificación: row.people.identification,
          'Nombre Aspirante': `${row.people.names} ${row.people.lastnames}`,
          Grado: row.degreeName,
          Celular: row.people.mobile,
          Email: row.people.email,
          Estado: row.isApproved == null ? 'Pendiente' : row.isApproved == 0 ? 'Rechazado' : 'Aprobado',
        });
      });

      exportFromJSON({ data, fileName, exportType });
    };

    async function serviceExcel() {
      try {
        const datos = await getExportExcel.run(Number(route.params.convocationStepId));

        // Aquí puedes hacer lo que desees con los datos obtenidos
        console.log('Datos obtenidos:', datos.file);
        const link = document.createElement('a');
        link.href = datos.file;
        link.click();
      } catch (error) {
        console.error('Error al consultar el servicio:', error);
      }
    }

    const getStatusLabel = (row: any) => {
      if (!row.requiresApproval) return row.isApproved == null ? 'Pendiente' : 'Finalizado';
      else {
        if (row.isApproved == null) return 'En revisión';
        else if (row.isApproved == 0) return 'Detenido';
        else if (row.isApproved == 1) return 'Aprobado';
        else if (row.isApproved == 2) return 'Finalizado';
      }
    };

    return {
      params,
      name,
      t,

      currentConvocationEnrolStepId,
      currentData,
      degreeId,
      userName,
      status,

      rejectedObservationsModal,
      inscritoDetailsModal,

      closeApproveOrRejectModal,
      openInscritoDetailsModal,
      approveOrReject,
      getStatusLabel,
      downloadExcel,
      serviceExcel,
    };
  },
});
</script>
