<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <template v-else>
          <div>
            <!-- Accodion Form-->
            <AppAccordion class="mt-2" v-slot="{ accordionId }" :styleType="'clean'">
              <AppAccordionItem :accordion-id="accordionId">
                <template v-slot:head><h5 class="fw-bold text-primary">Información General del Movimiento</h5></template>
                <template v-slot:content>
                  <div class="container-fluid">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Monto comprometido</label>
                        <p class="form-control-plaintext">{{ data.value }}</p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Programa</label>
                        <p class="form-control-plaintext">
                          {{ data.programName }}
                        </p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Subprograma</label>
                        <p class="form-control-plaintext">
                          {{ data.subProgramName }}
                        </p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Proyecto</label>
                        <p class="form-control-plaintext">
                          {{ data.projectName }}
                        </p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Representante legal</label>
                        <p class="form-control-plaintext">
                          {{ data.nameLegalRepresentative }}
                        </p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Período académico</label>
                        <p class="form-control-plaintext">
                          {{ data.academicPeriodsName }}
                        </p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Fecha y hora</label>
                        <p class="form-control-plaintext">
                          {{ dayjs(data.date).format('DD/MM/YYYY') }}
                        </p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label fw-bold">Concepto</label>
                        <p class="form-control-plaintext">{{ data.concept }}</p>
                      </div>
                    </div>
                  </div>
                </template>
              </AppAccordionItem>
              <AppAccordionItem :accordion-id="accordionId">
                <template v-slot:head><h5 class="fw-bold text-primary">Distribución del movimiento</h5></template>
                <template v-slot:content>
                  <div class="row mb-3">
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Proveedor</label>
                      <p class="form-control-plaintext">
                        {{ data.businessName }}
                      </p>
                    </div>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.budgetPaymentFormId" label="Seleccionar la forma de pago" style="max-width: 50%">
                      <AppAutocomplete v-model="v$.form.budgetPaymentFormId.$model" :options="budgetPaymentForms" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                    <AppFormField v-if="!budgetPaymentValidation" :form-control="v$.form.distributionMoneyId" label="Seleccionar la distribución del dinero">
                      <AppAutocomplete
                        v-model="v$.form.distributionMoneyId.$model"
                        :options="distributionMoneys"
                        :clearable="false"
                        label="label"
                        :disabled="budgetPaymentValidation"
                      ></AppAutocomplete>
                    </AppFormField>
                    <AppFormField v-if="!budgetPaymentValidation" :form-control="v$.form.countPayment" label="Seleccionar la cantidad de pagos">
                      <input class="form-control" type="number" id="countPayment" v-model="v$.form.countPayment.$model" :min="2" :disabled="budgetPaymentValidation" />
                    </AppFormField>
                  </div>
                  <div class="card-body table-responsive p-2 mt-3">
                    <table class="table table-bordered table align-middle text-center">
                      <thead>
                        <tr>
                          <th colspan="5">Distribución de proveedores</th>
                        </tr>
                        <tr>
                          <th>#</th>
                          <th>Proveedores</th>
                          <th>Monto</th>
                          <th>Monto Inicial</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody style="border-top: none">
                        <tr v-for="(row, index) in form.supplierId" :key="index">
                          <td>{{ index + 1 }}</td>
                          <td>{{ row.businessName }}</td>
                          <td>
                            <input type="number" v-model.number="row.value" class="form-control text-center" :disabled="true" min="1" @input="updateInitial(row)" />
                          </td>
                          <td>
                            <input
                              type="number"
                              v-model.number="row.valueInitial"
                              class="form-control text-center"
                              :disabled="distributionMoneyValidation || budgetPaymentValidation"
                              min="1"
                              :max="row.value - 1"
                            />
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                      <tfoot v-if="form.supplierId.length > 0" style="border-top: none" class="fw-bold">
                        <tr>
                          <td colspan="2">Total</td>
                          <td class="text-center">
                            {{ n(totalCommitted ?? 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(totalCommittedInitial ?? 0) }}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </template>
              </AppAccordionItem>
            </AppAccordion>
          </div>
        </template>
      </template>
      <template v-slot:actions>
        <div class="action-button-form">
          <AppButton label="core.save" :nativeType="'submit'"></AppButton>
        </div>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, computed, ref, onMounted, watch, onUnmounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import { BudgetExecutionConstants } from '../constant/budgetExecution.constant';

import { GetBudgetReportItemsService } from '../services/getBudgetReportItems.service';
import { CreateOrUpdateBudgetCdtService } from '../services/createOrUpdateBudgetCdt.service';
import { GetTablesBudgetsService } from '../services/getTablesBudgets.service';
import { GetAllPaymentMethodsService } from '../services/getAllPaymentMethods.service';
import { GetDistributionMoneyService } from '../services/getDistributionMoney.service';
import { GetStatusReportQueueService } from '../../reports/services/getStatusReportQueue.service';

import { ToastService } from '../../../shared/services/toast.service';
import { paymentMethodsDto } from '../dtos/paymentMethods.dto';

const getBudgetReportItemsService = new GetBudgetReportItemsService();
const createOrUpdateBudgetCdtService = new CreateOrUpdateBudgetCdtService();
const getTablesBudgetsService = new GetTablesBudgetsService();
const getAllPaymentMethodsService = new GetAllPaymentMethodsService();
const getDistributionMoneyService = new GetDistributionMoneyService();
const toastService = new ToastService();
const getStatusReportQueueService = new GetStatusReportQueueService();

export default defineComponent({
  name: 'FirstRpForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppAutocomplete,
    AppLoading,
    AppAccordion,
    AppAccordionItem,
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t, n } = useI18n();
    const loading = ref(true);
    const title = ref('Crear registro presupuestal');
    const optionsReportItems = ref();
    const nameTables = ref();
    const distributionMoneys = ref();
    const budgetPaymentForms = ref<paymentMethodsDto[]>([]);
    const report = ref<any>();

    const totalCommitted = computed(() => form.supplierId.reduce((sum, row) => sum + Number(row.value || 0), 0));
    const totalCommittedInitial = computed(() => {
      const total = form.supplierId.reduce((sum, row) => sum + Number(row.valueInitial || 0), 0);
      return parseFloat(total.toFixed(2));
    });

    const budgetPaymentValidation = computed(() => {
      const selected = budgetPaymentForms.value.find((item: paymentMethodsDto) => form.budgetPaymentFormId === item.id);
      return selected?.code === 'UNICO';
    });
    const distributionMoneyValidation = computed(() => {
      const selected = distributionMoneys.value.find((item: any) => form.distributionMoneyId === item.id);
      return selected?.id === 1; //Iguales
    });

    onMounted(async () => {
      loading.value = true;
      console.log(props);
      try {
        optionsReportItems.value = await getBudgetReportItemsService.run();
        nameTables.value = await getTablesBudgetsService.run();
        budgetPaymentForms.value = await getAllPaymentMethodsService.run();
        distributionMoneys.value = await getDistributionMoneyService.run();
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    });
    const supplier = {
      businessName: props.data?.businessName,
      id: props.data?.supplierId,
      value: props.data?.value,
    };
    const form = reactive({
      priceNew: props.data?.value ?? null,
      date: props.data?.dateCreate ? dayjs(props.data?.dateCreate).format('YYYY-MM-DDTHH:mm') : null,
      programId: props.data?.programId ?? null,
      subProgramId: props.data?.subProgramId ?? null,
      projectId: props.data?.projectId ?? null,
      concept: props.data?.concept ?? null,
      academicPeriodId: props.data?.academicPeriodId ?? null,
      supplierId: [supplier] as any[],
      distributionSuppliersId: props.data?.distributionSupplier ?? null,
      legalRepresentativeId: props.data?.legalRepresentativeId ?? null,
      budgetPaymentFormId: null,
      distributionMoneyId: null,
      countPayment: null,
    });
    // Reglas de validación
    const rules = computed(() => ({
      form: {
        priceOld: {},
        priceNew: { required },
        date: { required },
        programId: {},
        subProgramId: {},
        projectId: {},
        concept: {},
        academicPeriodId: { required },
        supplierId: { required },
        legalRepresentativeId: { required },
        budgetPaymentFormId: { required },
        distributionMoneyId: !budgetPaymentValidation.value ? { required } : {},
        countPayment: !budgetPaymentValidation.value ? { required } : {},
      },
    }));
    const v$ = useVuelidate(rules, { form });

    const updateInitial = (row: any) => {
      if (budgetPaymentValidation.value) {
        row.valueInitial = row.value;
      } else {
        if (distributionMoneyValidation.value) {
          row.valueInitial = parseFloat((row.value / (form.countPayment ?? 1)).toFixed(2)); //Monto inicial: Monto comprometido / cantidad de pagos
        }
      }
    };
    watch(
      () => form.budgetPaymentFormId,
      async () => {
        if (budgetPaymentValidation.value) {
          //Pago unico
          form.distributionMoneyId = null;
          form.countPayment = null;
          if (form.supplierId.length > 0) {
            form.supplierId.forEach((row) => {
              row.valueInitial = row.value;
            });
          }
        }
      }
    );
    watch(
      () => form.countPayment,
      async (newVal) => {
        if (newVal) {
          if (form.supplierId.length > 0 && distributionMoneyValidation.value) {
            //Distribución iguales
            form.supplierId.forEach((row: any) => {
              row.valueInitial = parseFloat((row.value / newVal).toFixed(2)); //Monto inicial: Monto comprometido / cantidad de pagos
            });
          }
        }
      }
    );
    const status = ref('IN_PROGRESS'); // Estado inicial
    let timer: ReturnType<typeof setTimeout> | undefined = undefined; // Para guardar el id del setTimeout
    const verifyStatus = async (maxRetries = 10) => {
      let retries = 0;

      const checkStatus = async () => {
        if (retries >= maxRetries) {
          console.error('Máximo de intentos alcanzado.');
          return;
        }

        if (report.value.reportId) {
          const response = await getStatusReportQueueService.run(report.value.reportId);

          if (response) {
            status.value = response.status; // Estado actual ("IN_PROGRESS", "OK", etc.)

            if (status.value === 'OK') {
              loading.value = false;
              emit('close');
              return;
            }
          }
        }

        // Si el reporte sigue en proceso, intentar nuevamente
        if (status.value === 'IN_PROGRESS') {
          retries++;
          timer = setTimeout(async () => {
            await checkStatus(); // Vuelve a consultar después de 1 segundo
          }, 1000);
        }
      };
      checkStatus(); // Inicia la verificación del estado
      // Limpiar el timeout cuando el componente se desmonta
      onUnmounted(() => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    };

    const showWarningToast = (message: string) => {
      toastService.hide();
      toastService.show(message, 'warning');
    };

    const save = async () => {
      console.log(form);
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) {
        showWarningToast('Valida los campos del formulario.');
        return;
      }
      if (totalCommitted.value !== form.priceNew) {
        showWarningToast('El monto total de los proveedores debe ser igual al nuevo monto comprometido.');
        return;
      }
      const validateValueSupplier = form.supplierId.every((supplier: any) => supplier.value > 0);
      if (validateValueSupplier === false) {
        showWarningToast('El monto de cada proveedor debe ser mayor a 0.');
        return;
      }
      loading.value = true;
      const dataCdt = {
        value: form.priceNew,
        concept: form.concept,
        convertTo: 'pdf',
        itemCodeCdt: optionsReportItems.value?.[0]?.code,
        itemCodeBudget: optionsReportItems.value?.[1]?.code,
        programId: form.programId,
        subProgramId: form.subProgramId,
        projectId: form.projectId,
        dateProject: dayjs(form.date).format('YYYY-MM-DD HH:mm'),
        academicPeriodId: form.academicPeriodId,
        actionId: props.data?.actionId,
        nameTable: nameTables.value?.find((item: any) => item.id === 3)?.label,
        legalRepresentativeId: form.legalRepresentativeId,
        statusId: 0, //Estado CDT
        dataSupplier: form.supplierId.map((item: any) => ({
          supplierId: item.id,
          value: item.value,
        })),
        numberReportCdt: props.data?.codeReport ?? null,
        distributionSupplier: form.distributionSuppliersId ?? null,
      };
      const dataCdtWithRp = {
        ...dataCdt,
        dataRegister: [
          {
            budgetPaymentFormId: form.budgetPaymentFormId,
            distributionMoney: distributionMoneys.value?.find((item: any) => item.id === form.distributionMoneyId)?.label || null,
            countPayments: form.countPayment || null,
            statusId: 0,
            suppliers: form.supplierId.map((item: any) => ({
              supplierId: item.id,
              value: item.value,
              valueInitial: item.valueInitial,
            })),
          },
        ],
      };

      try {
        //CDT + RP
        report.value = await createOrUpdateBudgetCdtService.run(dataCdtWithRp);
        await verifyStatus();
      } catch (e) {
        console.error(e);
        loading.value = false;
      }
    };

    return {
      t,
      n,
      title,
      save,
      v$,
      dayjs,
      loading,
      BudgetExecutionConstants,
      form,
      totalCommitted,
      totalCommittedInitial,
      budgetPaymentForms,
      distributionMoneys,
      budgetPaymentValidation,
      distributionMoneyValidation,
      updateInitial,
    };
  },
});
</script>
<style scoped>
:deep(.accordion .o-accordion-button) {
  font-size: 18px;
}
</style>
