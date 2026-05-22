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
                <template v-slot:head>Información del Movimiento</template>
                <template v-slot:content>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.priceOld" :label="`${nameTitle} anterior`">
                      <input :disabled="true" class="form-control" type="number" id="priceOld" v-model="v$.form.priceOld.$model" />
                    </AppFormField>
                    <AppFormField :form-control="v$.form.priceNew" :label="`${nameTitle} nueva`">
                      <input class="form-control" type="number" id="priceNew" v-model="v$.form.priceNew.$model" />
                    </AppFormField>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.documentsGenerateId" label="Seleccionar documentos">
                      <AppAutocomplete v-model="v$.form.documentsGenerateId.$model" :options="optionsDocumentsGenerate" label="label" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.programId" label="Seleccionar programa">
                      <AppAutocomplete v-model="v$.form.programId.$model" :options="optionsExpensesBills" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.subProgramId" label="Seleccionar Subprograma">
                      <AppAutocomplete v-model="v$.form.subProgramId.$model" :options="optionsExpensesBills" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.projectId" label="Seleccionar proyecto">
                      <AppAutocomplete v-model="v$.form.projectId.$model" :options="optionsExpensesBills" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.rolId" label="Rol del representante legal">
                      <AppAutocomplete v-model="v$.form.rolId.$model" :options="rolUsers" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.legalRepresentativeId" label="Representante legal">
                      <AppAutocomplete
                        v-model="v$.form.legalRepresentativeId.$model"
                        :options="allUsers"
                        label="names"
                        :clearable="false"
                        :reduce="(d:any) => d.peopleId"
                        :loading="loadingUsers"
                      ></AppAutocomplete>
                    </AppFormField>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.academicPeriodId" label="Seleccionar período">
                      <AppAutocomplete v-model="v$.form.academicPeriodId.$model" :options="optionsAcademicPeriod" :clearable="false"></AppAutocomplete>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.date" :label="'Fecha y hora'">
                      <input class="form-control" type="datetime-local" id="date" v-model="v$.form.date.$model" />
                    </AppFormField>
                  </div>
                  <AppFormField :form-control="v$.form.concept" :label="'Concepto'">
                    <input class="form-control" type="text" id="concept" v-model="v$.form.concept.$model" />
                  </AppFormField>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.urlDocument" :label="'Documento de respaldo'">
                      <AppUploadFile v-model="v$.form.urlDocument.$model" input-id="urlDocument"></AppUploadFile>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.description" :label="'Descripción del movimiento'">
                      <input class="form-control" type="text" id="description" v-model="v$.form.description.$model" />
                    </AppFormField>
                  </div>
                </template>
              </AppAccordionItem>
              <AppAccordionItem :accordion-id="accordionId">
                <template v-slot:head>Distribución del movimiento</template>
                <template v-slot:content>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.distributionSuppliersId" label="Seleccionar distribuicion de proveedores">
                      <AppAutocomplete
                        v-model="v$.form.distributionSuppliersId.$model"
                        :options="distributionSuppliers"
                        :clearable="false"
                        label="label"
                        :reduce="(d:any) => d.label"
                      ></AppAutocomplete>
                    </AppFormField>
                    <AppFormField :form-control="v$.form.supplierId" label="Seleccionar proveedor">
                      <AppMultiSelectPrime
                        v-model="v$.form.supplierId.$model"
                        label="businessName"
                        placeholder="Empieza a escribir para buscar..."
                        :options="optionsSupplier"
                        @search="searchSupplier"
                        :clearable="false"
                        :filter="true"
                        :loading="loadingSupplier"
                        :reduce="(d:any) => d"
                        :selectionLimit="form.distributionSuppliersId === 'UNICO' ? 1 : undefined"
                        :disabled="!form.distributionSuppliersId"
                      >
                      </AppMultiSelectPrime>
                    </AppFormField>
                  </div>
                  <div class="form-row" v-if="budgetRegisterValidation">
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
                          <th v-if="budgetRegisterValidation">Monto Inicial</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody style="border-top: none">
                        <tr v-for="(row, index) in form.supplierId" :key="index">
                          <td>{{ index + 1 }}</td>
                          <td>{{ row.businessName }}</td>
                          <td>
                            <input type="number" v-model.number="row.value" class="form-control text-center" :disabled="form.distributionSuppliersId === 'UNICO'" min="1" @input="updateInitial(row)" />
                          </td>
                          <td v-if="budgetRegisterValidation">
                            <input
                              type="number"
                              v-model.number="row.valueInitial"
                              class="form-control text-center"
                              :disabled="distributionMoneyValidation || budgetPaymentValidation"
                              min="1"
                              :max="row.value - 1"
                            />
                          </td>
                          <td>
                            <AppButtonDelete @click="removeSupplier(row)"></AppButtonDelete>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot v-if="form.supplierId.length > 0" style="border-top: none" class="fw-bold">
                        <tr>
                          <td colspan="2">Total</td>
                          <td class="text-center">
                            {{ n(totalCommitted ?? 0) }}
                          </td>
                          <td v-if="budgetRegisterValidation" class="text-center">
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
import { defineComponent, reactive, computed, ref, onMounted, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { debounce } from 'ts-debounce';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppMultiSelectPrime from '../../../shared/components/Forms/AppMultiSelectPrime.vue';
import { BudgetExecutionConstants } from '../constant/budgetExecution.constant';

import { CreateOrUpdateAmountMonthBudgetExpenseExecutionService } from '../services/createOrUpdateAmountMonthBudgetExpenseExecution.service';
import { CreateOrUpdateActionsBudgetsService } from '../services/createOrUpdateActionsBudgets.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetSuppliersCommittedService } from '../services/getSuppliersCommitted.service';
import { GetBudgetReportItemsService } from '../services/getBudgetReportItems.service';
import { CreateOrUpdateBudgetCdtService } from '../services/createOrUpdateBudgetCdt.service';
import { CreateOrUpdateBudgetCdtNewService } from '../services/createOrUpdateBudgetCdtNew.service';
import { GetDistributionSuppliersService } from '../services/getDistributionSuppliers.service';
import { GetTablesBudgetsService } from '../services/getTablesBudgets.service';
import { GetAllRolesAdministrativeService } from '../../access/services/getAllRolesAdministrative.service';
import { GetUserByRoleService } from '../../reports/services/reports/getUserByRole.service';
import { GetAllPaymentMethodsService } from '../services/getAllPaymentMethods.service';
import { GetDistributionMoneyService } from '../services/getDistributionMoney.service';
import { GetOptionsCdpsService } from '../services/getOptionsCdps.service';

import { ToastService } from '../../../shared/services/toast.service';
import { paymentMethodsDto } from '../dtos/paymentMethods.dto';

const createOrUpdateAmountMonthBudgetExpenseExecutionService = new CreateOrUpdateAmountMonthBudgetExpenseExecutionService();
const createOrUpdateActionsBudgetsService = new CreateOrUpdateActionsBudgetsService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const getSuppliersCommittedService = new GetSuppliersCommittedService();
const getBudgetReportItemsService = new GetBudgetReportItemsService();
const createOrUpdateBudgetCdtNewService = new CreateOrUpdateBudgetCdtNewService();
const createOrUpdateBudgetCdtService = new CreateOrUpdateBudgetCdtService();
//const updateSignatureSuppliersService = new UpdateSignatureSuppliersService();
const getDistributionSuppliersService = new GetDistributionSuppliersService();
const getTablesBudgetsService = new GetTablesBudgetsService();
const getAllRolesAdministrativeService = new GetAllRolesAdministrativeService();
const getUserByRoleService = new GetUserByRoleService();
const getAllPaymentMethodsService = new GetAllPaymentMethodsService();
const getDistributionMoneyService = new GetDistributionMoneyService();
const getOptionsCdpsService = new GetOptionsCdpsService();
const toastService = new ToastService();

export default defineComponent({
  name: 'CommitedAmountExpenseForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppUploadFile,
    AppAutocomplete,
    AppLoading,
    AppAccordion,
    AppButtonDelete,
    AppAccordionItem,
    AppMultiSelectPrime,
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
    detailData: {
      type: Object,
      required: true,
    },
    dataIncomeExpense: {
      type: Object,
      required: true,
    },
    detailPeriod: {
      type: Object,
      required: true,
    },
    dataExecutionOfExpense: {
      type: Object,
      required: true,
    },
    entity: {
      type: String,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t, n } = useI18n();
    const loading = ref(true);
    const loadingUsers = ref(false);
    const entityConfig: any = {
      commitedAmount: {
        titlePrefix: 'Monto comprometido',
        key: BudgetExecutionConstants.Fields.COMMITED_AMOUNT,
      },
    };
    const currentEntity = computed(() => entityConfig[props.entity] || {});
    const key = computed(() => currentEntity.value.key);
    const nameTitle = computed(() => currentEntity.value.titlePrefix);
    const amountMonthTranslation = `Monto de ${props.data?.nameMonth}`;
    const detailData = props.detailData?.financing_sources?.id ? `${props.detailData?.financing_sources?.code}` : `${props.detailData?.type_financing_sources?.code}`;
    const title = props.data?.executedAmount
      ? `core.edit ${amountMonthTranslation} / Código: ${detailData}  / ${props.detailPeriod?.namePeriod}`
      : `core.new ${amountMonthTranslation} / Código: ${detailData}  / ${props.detailPeriod?.namePeriod}`;
    const optionsAcademicPeriod = ref();
    const optionsSupplier = ref();
    const optionsDocumentsGenerate = ref();
    const optionsReportItems = ref();
    const distributionSuppliers = ref<any>([]);
    const loadingSupplier = ref(false);
    //const valideSignatureSupplier = ref(false);
    const nameTables = ref();
    const rolUsers = ref();
    const allUsers = ref();
    const distributionMoneys = ref();
    const budgetPaymentForms = ref<paymentMethodsDto[]>([]);
    const optionsExpensesBills = computed(
      () =>
        props.dataIncomeExpense?.budgetPlanningBills
          ?.filter((item: any) => item.financing_sources && Object.keys(item.financing_sources).length > 0) // Filtra si financing_sources no está vacío
          .map((item: any) => item.financing_sources) || []
    );
    const distributionSuppliersValidation = computed(() => form.distributionSuppliersId);
    const totalCommitted = computed(() => form.supplierId.reduce((sum, row) => sum + Number(row.value || 0), 0));
    const totalCommittedInitial = computed(() => {
      const total = form.supplierId.reduce((sum, row) => sum + Number(row.valueInitial || 0), 0);
      return parseFloat(total.toFixed(2));
    });

    const budgetRegisterValidation = computed(() => form.documentsGenerateId === 2); //CDT + RP
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
        optionsAcademicPeriod.value = await getAcademicPeriodsService.run();
        optionsReportItems.value = await getBudgetReportItemsService.run();
        distributionSuppliers.value = await getDistributionSuppliersService.run();
        optionsDocumentsGenerate.value = await getOptionsCdpsService.run();
        nameTables.value = await getTablesBudgetsService.run();
        rolUsers.value = await getAllRolesAdministrativeService.run();
        budgetPaymentForms.value = await getAllPaymentMethodsService.run();
        distributionMoneys.value = await getDistributionMoneyService.run();
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    });

    const form = reactive({
      priceOld: props.data?.[key.value] ?? null,
      priceNew: props.data?.[key.value] ?? null,
      date: null,
      urlDocument: '',
      description: '',
      programId: null,
      subProgramId: null,
      projectId: null,
      concept: null,
      academicPeriodId: null,
      supplierId: [] as any[],
      file: null,
      distributionSuppliersId: null,
      documentsGenerateId: null,
      rolId: null,
      legalRepresentativeId: null,
      //RP
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
        urlDocument: {},
        description: {},
        programId: { required },
        subProgramId: { required },
        projectId: { required },
        concept: { required },
        academicPeriodId: { required },
        supplierId: { required },
        distributionSuppliersId: { required },
        documentsGenerateId: { required },
        rolId: { required },
        legalRepresentativeId: { required },
        budgetPaymentFormId: budgetRegisterValidation.value ? { required } : {},
        distributionMoneyId: budgetRegisterValidation.value && !budgetPaymentValidation.value ? { required } : {},
        countPayment: budgetRegisterValidation.value && !budgetPaymentValidation.value ? { required } : {},
      },
    }));
    const v$ = useVuelidate(rules, { form });

    const searchSupplier = debounce(async (search: string) => {
      if (search) {
        loadingSupplier.value = true;

        if (search.length >= 2) {
          optionsSupplier.value = [];
          const params = {
            budgetPlanningExecutedId: props.data?.id,
            search: search,
          };
          optionsSupplier.value = await getSuppliersCommittedService.run(params);
        } else {
          optionsSupplier.value = [];
        }

        loadingSupplier.value = false;
      }
    }, 800);
    const removeSupplier = (supplier: any) => {
      form.supplierId = form.supplierId.filter((item: any) => item.id !== supplier.id);
    };

    watch(
      () => form.distributionSuppliersId,
      () => {
        form.supplierId.splice(0); // reset al cambiar
        optionsSupplier.value = optionsSupplier.value?.map((supplier: any) => ({
          ...supplier,
          value: 0,
          valueInitial: 0,
        }));
      }
    );
    watch(
      () => form.supplierId,
      () => {
        if (form.distributionSuppliersId === 'UNICO' && form.supplierId.length > 0) {
          form.supplierId[0].value = form.priceNew; // Asignar el nuevo monto al proveedor único
        }
      }
    );
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
      () => form.rolId,
      async () => {
        if (form.rolId) {
          loadingUsers.value = true;
          try {
            allUsers.value = await getUserByRoleService.run(form.rolId);
          } catch (e) {
            console.error(e);
          }
          loadingUsers.value = false;
        }
      }
    );
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
    const showWarningToast = (message: string) => {
      toastService.hide();
      toastService.show(message, 'warning');
    };

    const save = async () => {
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
      if (form.distributionSuppliersId !== 'UNICO' && form.supplierId.length < 2) {
        showWarningToast('Selecciona mas de un proveedor o cambia la distribucion de proveedores a UNICO.');
        return;
      }
      loading.value = true;
      const dataAction = new FormData();
      dataAction.append('fieldId', props.data?.id);
      dataAction.append('tableName', BudgetExecutionConstants.Tables.BUDGET_PLANNING_EXECUTED);
      dataAction.append('key', key.value);
      dataAction.append('date', dayjs(form.date).format('YYYY-MM-DD HH:mm'));
      dataAction.append('priceOld', form.priceOld ?? 0);
      dataAction.append('priceNew', form.priceNew);
      dataAction.append('urlDocument', form.urlDocument);
      dataAction.append('description', form.description);
      dataAction.append('fieldAgainCreditId', 'null');
      dataAction.append('parentId', 'null');
      dataAction.append('executionOfExpenseId', props.dataExecutionOfExpense?.execution_of_expenses?.id);

      const dataBudget = {
        financingSourcePeriodId: props.data.financingSourcePeriodId,
        month: props.data.month,
        budgetPlanningId: props.dataIncomeExpense?.budgetPlanningIncome?.[0]?.id,
        [key.value]: form.priceNew,
      };
      createOrUpdateAmountMonthBudgetExpenseExecutionService.params = {
        parentId: props.detailData?.parentId,
        executionOfExpenseId: props.dataExecutionOfExpense?.execution_of_expenses?.id,
      };
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
        actionId: null,
        //supplierId: form.supplierId,
        nameTable: nameTables.value?.find((item: any) => item.id === 3)?.label,
        legalRepresentativeId: form.legalRepresentativeId,
        statusId: 0, //Estado CDT
        dataSupplier: form.supplierId.map((item: any) => ({
          supplierId: item.id,
          value: item.value,
        })),
        distributionSupplier: form.distributionSuppliersId,
        sourceOfIncomeId: props.dataIncomeExpense?.budgetPlanningIncome?.[0]?.financing_sources.id,
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
        /* if (valideSignatureSupplier.value) {
          // Actualizar la firma
          await updateSignatureSuppliersService.run({ file: form.file }, selectedSupplier.value?.id);
        } */
        // Crear o actualizar el presupuesto
        await createOrUpdateAmountMonthBudgetExpenseExecutionService.run(dataBudget, props.data?.id);
        // Actualizar la accion
        const res = await createOrUpdateActionsBudgetsService.run(dataAction);
        // Crear o actualizar el CTD
        dataCdt.actionId = res.data?.actionsBudgets;
        dataCdtWithRp.actionId = res.data?.actionsBudgets;
        if (form.documentsGenerateId === 1) {
          //CDT
          await createOrUpdateBudgetCdtNewService.run(dataCdt);
        } else if (form.documentsGenerateId === 2) {
          //CDT + RP
          await createOrUpdateBudgetCdtService.run(dataCdtWithRp);
        }
        loading.value = false;
        emit('close');
      } catch (e) {
        console.error(e);
        loading.value = false;
      }
    };

    return {
      t,
      n,
      title,
      nameTitle,
      save,
      v$,
      loading,
      optionsExpensesBills,
      key,
      BudgetExecutionConstants,
      optionsAcademicPeriod,
      optionsSupplier,
      searchSupplier,
      //valideSignatureSupplier,
      distributionSuppliers,
      optionsDocumentsGenerate,
      loadingSupplier,
      form,
      removeSupplier,
      distributionSuppliersValidation,
      totalCommitted,
      totalCommittedInitial,
      rolUsers,
      allUsers,
      budgetRegisterValidation,
      budgetPaymentForms,
      distributionMoneys,
      budgetPaymentValidation,
      distributionMoneyValidation,
      updateInitial,
      loadingUsers,
    };
  },
});
</script>
<style scoped>
:deep(.accordion .o-accordion-button) {
  font-size: 18px;
}
</style>
