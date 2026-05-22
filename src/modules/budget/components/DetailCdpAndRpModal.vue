<template>
  <form @submit.prevent="save">
    <AppLoading v-if="loading" />

    <AppFormModal v-else :title="title">
      <template v-slot:content>
        <AppAccordion class="mt-2" v-slot="{ accordionId }" :styleType="'clean'">
          <AppAccordionItem :accordion-id="accordionId">
            <template v-slot:head><h5 class="fw-bold text-primary">Certificado de Disponibilidad Presupuestal (CDP)</h5> </template>
            <template v-slot:content>
              <!-- Información general del CDP -->
              <div class="mb-4">
                <div class="container-fluid">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <AppFormField :form-control="v$.form.cdpStatusId" label="Estado del CDP">
                        <AppAutocomplete :options="contractsStates" v-model="v$.form.cdpStatusId.$model" label="value" :reduce="(state:any) => state.label" />
                      </AppFormField>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold mb-0">Monto comprometido</label>
                      <p class="form-control-plaintext">{{ data?.value }}</p>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold mb-0">Programa</label>
                      <p class="form-control-plaintext">
                        {{ data?.programName }}
                      </p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold mb-0">Subprograma</label>
                      <p class="form-control-plaintext">
                        {{ data?.subProgramName }}
                      </p>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold mb-0">Proyecto</label>
                      <p class="form-control-plaintext">
                        {{ data?.projectName }}
                      </p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold mb-0">Representante legal</label>
                      <p class="form-control-plaintext">
                        {{ data?.nameLegalRepresentative }}
                      </p>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold mb-0">Período académico</label>
                      <p class="form-control-plaintext">
                        {{ data?.academicPeriodsName }}
                      </p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold mb-0">Fecha y hora</label>
                      <p class="form-control-plaintext">
                        {{ dayjs(data?.date).format('DD/MM/YYYY') }}
                      </p>
                    </div>
                  </div>
                  <div class="row">
                    <div class="mb-3">
                      <label class="form-label fw-bold mb-0">Concepto</label>
                      <p class="form-control-plaintext">{{ data?.concept }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </AppAccordionItem>
          <AppAccordionItem :accordion-id="accordionId" v-if="data?.dataBudgetRecords?.length > 0">
            <template v-slot:head><h5 class="fw-bold text-primary">Registros Presupuestales (RPs)</h5></template>
            <template v-slot:content>
              <!-- Información de los RPs -->
              <div v-for="(group, index) in data?.dataBudgetRecords" :key="index" class="card border-0 shadow-sm">
                <div class="card-body pt-0">
                  <div class="row mb-3">
                    <div class="col-md-4 mb-1">
                      <label class="form-label fw-bold mb-0">Forma de pago</label>
                      <p class="form-control-plaintext">
                        {{ group.budgetPaymentForm }}
                      </p>
                    </div>
                    <div class="col-md-4 mb-1">
                      <label class="form-label fw-bold mb-0">Distribución</label>
                      <p class="form-control-plaintext">
                        {{ group.distributionMoney }}
                      </p>
                    </div>
                    <div class="col-md-4 mb-1">
                      <label class="form-label fw-bold mb-0">Cantidad de pagos</label>
                      <p class="form-control-plaintext">
                        {{ group.countPayments }}
                      </p>
                    </div>
                  </div>
                  <div class="table-responsive">
                    <table class="table table-sm table-bordered align-middle">
                      <thead class="table-light">
                        <tr>
                          <th>#</th>
                          <th>Código</th>
                          <th>Valor</th>
                          <th style="min-width: 184px">Rango</th>
                          <th style="min-width: 154px">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(record, rIdx) in group.budgetRecords" :key="record.data.id">
                          <td>{{ rIdx + 1 }}</td>
                          <td>{{ record.data.code }}</td>
                          <td>{{ record.data.value }}</td>
                          <td>{{ record.date }}</td>
                          <td>
                            <template v-if="rIdx === 0">
                              <AppFormField class="mb-0">
                                <AppAutocomplete :options="contractsStates" v-model="getStatusByRecordId(record.data.id).data.status" label="value" :reduce="(state:any) => state.value" />
                              </AppFormField>
                            </template>
                            <template v-else>
                              {{ getStatusByRecordId(record.data.id).data.status }}
                            </template>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </template>
          </AppAccordionItem>
        </AppAccordion>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, onMounted, ref, toRefs, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';

import { UpdateReportStatesActionsBudgetsService } from '../services/updateReportStatesActionsBudgets.service';
import dayjs from 'dayjs';

const updateReportStatesActionsBudgetsService = new UpdateReportStatesActionsBudgetsService();

export default defineComponent({
  name: 'DetailCdpAndRpModal',
  components: {
    AppFormModal,
    AppFormField,
    AppLoading,
    AppAutocomplete,
    AppAccordion,
    AppAccordionItem,
  },

  props: {
    data: {
      type: Object,
      required: false,
    },
    contractsStates: {
      type: Array,
      required: true,
    },
  },
  emits: ['close', 'update'],

  setup(props, { emit }) {
    const { data } = toRefs(props);
    let title = ref('Información General del CDP y RPs');

    const loading = ref(true);
    const form: any = reactive({
      cdpStatusId: props.data?.statusId ?? null,
      rpStatuses: props.data?.dataBudgetRecords?.[0]?.budgetRecords ?? [],
    });
    const v$ = useVuelidate(
      {
        form: {
          cdpStatusId: { required },
          rpStatuses: { required },
        },
      },
      { form }
    );
    onMounted(async () => {
      loading.value = false;
      console.log(form.value);
    });
    const getStatusByRecordId = (id: any) => {
      return form.rpStatuses.find((r: any) => r.data.id === id);
    };

    // Observar los cambios en el valor del estado del CDP
    watch(
      () => v$.value.form.cdpStatusId.$model,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          // Aquí llamas tu servicio o función de flecha
          fetchDataBasedOnStatus(newValue, true); // isCdp = true
        }
      }
    );
    //rp
    watch(
      () => form.rpStatuses.map((item: any) => item.data.status),
      (newStatuses, oldStatuses) => {
        newStatuses.forEach((status: any, index: number) => {
          if (status !== oldStatuses[index]) {
            const item = form.rpStatuses[index];
            fetchDataBasedOnStatus(status, false, item.data.id); // isCdp = false
          }
        });
      }
    );
    // update state table
    const fetchDataBasedOnStatus = async (statusId: string, isCdp: boolean, rpId?: string) => {
      console.log('fetchDataBasedOnStatus', statusId, isCdp, rpId);
      try {
        const params = {
          statusId,
          isCdp: isCdp,
        };
        const targetId = isCdp ? props.data?.id : rpId;
        if (!targetId) return;
        await updateReportStatesActionsBudgetsService.run(targetId, params);
        emit('update');
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        const dataSend = {};
        await updateReportStatesActionsBudgetsService.run(dataSend, data.value?.id);
        emit('close');
      } catch (e) {
        console.error(e);
      }
    };

    return {
      title,
      loading,
      save,
      v$,
      form,
      getStatusByRecordId,
      dayjs,
    };
  },
});
</script>

<style scoped></style>
