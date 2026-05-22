<template>
  <AppLoading v-if="loading" />

  <AppDatatable v-else :name="name" :service="service" :params="params">
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

    <AppDatatableColumn label="Documentos" field="quantity" v-slot="{ row }">
      {{ row.quantity }}
    </AppDatatableColumn>

    <AppDatatableColumn label="Estado" field="status" v-slot="{ row }">
      {{ getStatusLabel(row) }}
    </AppDatatableColumn>

    <AppDatatableColumn v-slot="{ row }">
      <AppButtonGroup>
        <AppButton
          v-tooltip="'Verificar Documentos'"
          icon="file-alt"
          :to="{
            name: 'surveys.inscritoDetailsAttachmentAndDocument',
            params: {
              convocationId: convocationId,
              convocationStepId: convocationStepId,
              convocationEnrolStepId: row.id,
            },
          }"
        ></AppButton>

        <AppButton icon="thumbs-up" v-tooltip="'Aprobar Inscripción'" :disabled="!row.requiresApproval" @click="approveOrReject(1, row.id, row.rejectedObservations)" />

        <AppButton icon="thumbs-down" v-tooltip="'Rechazar Inscripción'" :disabled="!row.requiresApproval" @click="approveOrReject(0, row.id, row.rejectedObservations)" />
      </AppButtonGroup>
    </AppDatatableColumn>
  </AppDatatable>

  <AppModal v-model="rejectedObservationsModal">
    <RejectedObservations v-if="rejectedObservationsModal" :data="currentData" @close="closeApproveOrRejectModal" />
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';


import RejectedObservations from './RejectedObservations.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { UpdateApprovedByInscritoService } from '../services/updateApprovedByInscrito.service';

const updateDatatableService = new UpdateDatatableService();
const updateApprovedByInscritoService = new UpdateApprovedByInscritoService();

export default defineComponent({
  name: 'InscritosStepDocument',

  components: {
    RejectedObservations,
    AppDatatableColumn,
    AppAutocomplete,
    AppButtonGroup,
    AppDatatable,
    AppLoading,
    AppFilter,
    AppButton,
    AppModal,
  },

  props: ['service', 'convocationStepId', 'filters'],

  setup(props) {
    const { t } = useI18n();
    const name = 'inscritosStepForm';

    const convocationId = ref();
    const currentData = ref();
    const route = useRoute();
    const degreeId = ref();
    const status = ref();

    const rejectedObservationsModal = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        convocationId.value = parseInt(route.params.convocationId.toString(), 10);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

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
      degreeId,
      status,
      params,
      name,
      t,

      rejectedObservationsModal,
      convocationId,
      currentData,
      loading,

      closeApproveOrRejectModal,
      approveOrReject,
      getStatusLabel,
    };
  },
});
</script>
