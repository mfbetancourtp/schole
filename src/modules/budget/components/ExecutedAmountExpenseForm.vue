<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading" />
        <template v-else>
          <div v-if="key === BudgetExecutionConstants.Fields.EXECUTED_AMOUNT" class="nav nav-tabs">
            <button
              v-for="(section, index) in sectionsForm"
              :key="index"
              class="nav-link text-capitalize"
              type="button"
              :class="{ active: currentSectionForm === section.key }"
              @click="goToSectionForm(section.key)"
            >
              {{ section.name }}
            </button>
          </div>

          <div v-if="currentSectionForm === 'initialInformation'">
            <div class="form-row mt-3">
              <AppFormField :form-control="v$.form.priceOld" :label="`${nameTitle} anterior`">
                <input :disabled="true" class="form-control" type="number" id="priceOld" v-model="v$.form.priceOld.$model" />
              </AppFormField>
              <AppFormField :form-control="v$.form.priceNew" :label="`${nameTitle} nueva`">
                <input class="form-control" type="number" id="priceNew" v-model="v$.form.priceNew.$model" />
              </AppFormField>
            </div>
            <div class="form-row">
              <AppFormField v-if="key === BudgetExecutionConstants.Fields.COMMITED_AMOUNT" :form-control="v$.form.programId" label="Seleccionar programa">
                <AppAutocomplete v-model="v$.form.programId.$model" :options="optionsExpensesBills" :clearable="false"></AppAutocomplete>
              </AppFormField>
              <AppFormField v-if="key === BudgetExecutionConstants.Fields.COMMITED_AMOUNT" :form-control="v$.form.subProgramId" label="Seleccionar Subprograma">
                <AppAutocomplete v-model="v$.form.subProgramId.$model" :options="optionsExpensesBills" :clearable="false"></AppAutocomplete>
              </AppFormField>
            </div>
            <div class="form-row">
              <AppFormField v-if="key === BudgetExecutionConstants.Fields.COMMITED_AMOUNT" :form-control="v$.form.projectId" label="Seleccionar proyecto">
                <AppAutocomplete v-model="v$.form.projectId.$model" :options="optionsExpensesBills" :clearable="false"></AppAutocomplete>
              </AppFormField>
              <AppFormField :form-control="v$.form.supplierId" label="Seleccionar proveedor">
                <AppAutocomplete
                  v-model="v$.form.supplierId.$model"
                  label="businessName"
                  :options="optionsSupplier"
                  @search="searchSupplier"
                  @update:modelValue="validateSupplier"
                  :clearable="false"
                ></AppAutocomplete>
              </AppFormField>
              <AppFormField v-if="valideSignatureSupplier" style="margin-bottom: 0px !important" :form-control="v$.form.file" :label="'Firma de proveedor'">
                <AppUploadImage input-id="thumbnail" v-model="v$.form.file.$model"></AppUploadImage>
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField v-if="key === BudgetExecutionConstants.Fields.COMMITED_AMOUNT" :form-control="v$.form.academicPeriodId" label="Seleccionar período">
                <AppAutocomplete v-model="v$.form.academicPeriodId.$model" :options="optionsAcademicPeriod" :clearable="false"></AppAutocomplete>
              </AppFormField>
              <AppFormField :form-control="v$.form.date" :label="'Fecha y hora'">
                <input class="form-control" type="datetime-local" id="date" v-model="v$.form.date.$model" />
              </AppFormField>
            </div>
            <AppFormField v-if="key === BudgetExecutionConstants.Fields.COMMITED_AMOUNT" :form-control="v$.form.concept" :label="'Concepto'">
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
          </div>
          <div v-if="currentSectionForm === 'accountingMovement'" class="mt-3">
            <div class="card-body table-responsive p-2 mt-3">
              <table class="table table-bordered table align-middle text-center">
                <thead>
                  <tr>
                    <th colspan="3">Movimiento contable</th>
                  </tr>
                  <tr>
                    <th>Detalle</th>
                    <th>Débito</th>
                    <th>Crédito</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in tableData" :key="index">
                    <td>{{ row.detail }}</td>
                    <td>
                      <input type="number" class="form-control text-center" v-model.number="row.debit" :disabled="row.disabled ?? false" @input="handleInput(row, 'debit')" />
                    </td>
                    <td>
                      <input type="number" class="form-control text-center" v-model.number="row.credit" @input="handleInput(row, 'credit')" />
                    </td>
                  </tr>
                  <tr class="fw-bold">
                    <td>Sumas iguales</td>
                    <td>{{ totalDebit }}</td>
                    <td>{{ totalCredit }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="showErrorTotal" class="text-center alert alert-warning">
                <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
                <strong>Las sumas deben ser iguales.</strong>
              </div>
            </div>
          </div>
        </template>
      </template>

      <template v-slot:actions>
        <!--   <AppButton v-if="key === BudgetExecutionConstants.Fields.COMMITED_AMOUNT || activeTab === 'accountingMovement'"
         :label="'core.save'" 
         :nativeType="'submit'"></AppButton>
        <AppButton v-if="key === BudgetExecutionConstants.Fields.EXECUTED_AMOUNT && activeTab != 'accountingMovement'" 
        ></AppButton> -->
        <div class="action-button-form">
          <AppButton v-if="key === BudgetExecutionConstants.Fields.EXECUTED_AMOUNT" label="core.save" @click="goToNextSectionForm()"></AppButton>
          <AppButton v-if="key === BudgetExecutionConstants.Fields.COMMITED_AMOUNT" label="core.save" :nativeType="'submit'"></AppButton>
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
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { BudgetExecutionConstants } from '../constant/budgetExecution.constant';

import { CreateOrUpdateAmountMonthBudgetExpenseExecutionService } from '../services/createOrUpdateAmountMonthBudgetExpenseExecution.service';
import { CreateOrUpdateActionsBudgetsService } from '../services/createOrUpdateActionsBudgets.service';
import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { GetSuppliersCommittedService } from '../services/getSuppliersCommitted.service';
import { GetBudgetReportItemsService } from '../services/getBudgetReportItems.service';
import { CreateOrUpdateBudgetCdtService } from '../services/createOrUpdateBudgetCdt.service';
//import { CreateOrUpdateSuppliersService } from '../services/createOrUpdateSuppliers.service';
import { UpdateSignatureSuppliersService } from '../services/updateSignatureSuppliers.service';
import { GetSuppliersExecutedService } from '../services/getSuppliersExecuted.service';
import { CreateOrUpdateProofGraduationService } from '../services/createOrUpdateProofGraduation.service';

const createOrUpdateAmountMonthBudgetExpenseExecutionService = new CreateOrUpdateAmountMonthBudgetExpenseExecutionService();
const createOrUpdateActionsBudgetsService = new CreateOrUpdateActionsBudgetsService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const getSuppliersCommittedService = new GetSuppliersCommittedService();
const getBudgetReportItemsService = new GetBudgetReportItemsService();
const createOrUpdateBudgetCdtService = new CreateOrUpdateBudgetCdtService();
//const createOrUpdateSuppliersService = new CreateOrUpdateSuppliersService();
const updateSignatureSuppliersService = new UpdateSignatureSuppliersService();
const getSuppliersExecutedService = new GetSuppliersExecutedService();
const createOrUpdateProofGraduationService = new CreateOrUpdateProofGraduationService();

export default defineComponent({
  name: 'ExecutedAmountExpenseForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppUploadFile,
    AppAutocomplete,
    AppUploadImage,
    AppLoading,
    AppIcon,
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
    //const { n } = useI18n();
    const { t } = useI18n();
    const loading = ref(true);
    const entityConfig: any = {
      commitedAmount: {
        titlePrefix: 'Monto comprometido',
        key: BudgetExecutionConstants.Fields.COMMITED_AMOUNT,
      },
      executedAmount: {
        titlePrefix: 'Monto ejecutado',
        key: BudgetExecutionConstants.Fields.EXECUTED_AMOUNT,
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

    //const entityFields = computed(() => [fieldConfig[props.entity]]);
    const optionsAcademicPeriod = ref();
    const optionsSupplier = ref();
    const selectedSupplier = ref<any>();
    const optionsReportItems = ref();
    const showErrorTotal = ref(false);
    const valideSignatureSupplier = ref(false);
    const currentSectionForm = ref('initialInformation');
    const optionsExpensesBills = computed(
      () =>
        props.dataIncomeExpense?.budgetPlanningBills
          ?.filter((item: any) => item.financing_sources && Object.keys(item.financing_sources).length > 0) // Filtra si financing_sources no está vacío
          .map((item: any) => item.financing_sources) || []
    );
    onMounted(async () => {
      loading.value = true;
      try {
        optionsAcademicPeriod.value = await getAcademicPeriodsService.run();
        optionsReportItems.value = await getBudgetReportItemsService.run();
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
      supplierId: null,
      file: null,
    });
    // Reglas de validación
    const rules = computed(() => ({
      form: {
        priceOld: {},
        priceNew: { required },
        date: { required },
        urlDocument: {},
        description: {},
        programId: currentSectionForm.value === 'initialInformation' && key.value === BudgetExecutionConstants.Fields.COMMITED_AMOUNT ? { required } : {},
        subProgramId: currentSectionForm.value === 'initialInformation' && key.value === BudgetExecutionConstants.Fields.COMMITED_AMOUNT ? { required } : {},
        projectId: currentSectionForm.value === 'initialInformation' && key.value === BudgetExecutionConstants.Fields.COMMITED_AMOUNT ? { required } : {},
        concept: currentSectionForm.value === 'initialInformation' && key.value === BudgetExecutionConstants.Fields.COMMITED_AMOUNT ? { required } : {},
        academicPeriodId: currentSectionForm.value === 'initialInformation' && key.value === BudgetExecutionConstants.Fields.COMMITED_AMOUNT ? { required } : {},
        supplierId: { required }, //key.value === BudgetExecutionConstants.Fields.COMMITED_AMOUNT ? { required } : {},
        file: valideSignatureSupplier.value ? { required } : {},
      },
    }));
    const v$ = useVuelidate(rules, { form });

    const searchSupplier = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          optionsSupplier.value = [];
          const params = {
            budgetPlanningExecutedId: props.data?.id,
            search: search,
          };
          if (key.value === BudgetExecutionConstants.Fields.COMMITED_AMOUNT) {
            optionsSupplier.value = await getSuppliersCommittedService.run(params);
          } else if (key.value === BudgetExecutionConstants.Fields.EXECUTED_AMOUNT) {
            optionsSupplier.value = await getSuppliersExecutedService.run(params);
          }
        } else {
          optionsSupplier.value = [];
        }

        loading(false);
      }
    }, 800);
    const validateSupplier = (supplierId: number | string) => {
      if (!supplierId) {
        return;
      }
      // Buscar el proveedor correspondiente en el array
      selectedSupplier.value = optionsSupplier.value.find((supplier: any) => supplier.id === supplierId);
      console.log(selectedSupplier.value.value);
      if (!selectedSupplier.value?.signature) {
        valideSignatureSupplier.value = true;
        console.log('El proveedor seleccionado no tiene firma.');
        return;
      }
      valideSignatureSupplier.value = false;
    };
    //accountingMovement
    const tableData = ref([
      {
        detail: 'subtotal',
        debit: selectedSupplier.value?.value ?? 0,
        credit: 0,
        disabled: true,
      },
      {
        detail: 'excento',
        debit: selectedSupplier.value?.value ?? 0,
        credit: 0,
        disabled: true,
      },
      { detail: 'gravados', debit: 0, credit: 0 },
      { detail: 'iva', debit: 0, credit: 0 },
      { detail: 'retefuente', debit: 0, credit: 0 },
      { detail: 'reteiva', debit: 0, credit: 0 },
      { detail: 'neto a pagar', debit: 0, credit: 0 },
    ]);
    const handleInput = (row: any, key: any) => {
      if (row[key] === '' || row[key] === null || isNaN(row[key])) {
        row[key] = 0;
      }
    };
    const totalDebit = computed(() => tableData.value.reduce((sum, row) => sum + row.debit, 0));
    const totalCredit = computed(() => tableData.value.reduce((sum, row) => sum + row.credit, 0));
    watch(selectedSupplier, (newSupplier) => {
      // Aquí actualizas los valores de la tabla con el nuevo supplier
      console.log(newSupplier);
      if (newSupplier) {
        tableData.value = tableData.value.map((row) => ({
          ...row,
          debit: row.detail === 'subtotal' || row.detail === 'excento' ? newSupplier.value ?? 0 : row.debit,
        }));
      }
    });
    //Manejo de secciones
    const sectionsForm = ref([
      {
        key: 'initialInformation',
        name: t('Información inicial'),
        icon: '',
      },
      {
        key: 'accountingMovement',
        name: 'Movimiento contable',
        icon: '',
      },
    ]);
    const goToSectionForm = async (section: any) => {
      //cambia a la nueva sección
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      currentSectionForm.value = section;
      console.log('goToSectionForm');
    };
    const goToNextSectionForm = async () => {
      const currentIndex = sectionsForm.value.findIndex((section) => section.key === currentSectionForm.value);

      if (currentIndex !== -1) {
        const formIsValid = await v$.value.$validate();
        if (!formIsValid) return;

        if (currentIndex < sectionsForm.value.length - 1) {
          // Si no es la última sección, avanza a la siguiente
          currentSectionForm.value = sectionsForm.value[currentIndex + 1].key;
        } else {
          // Si es la última sección, redirige
          await save();
        }
      } else {
        // Manejo de errores
        console.error('Error al guardar los datos.');
      }
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      console.log(totalDebit.value, totalCredit.value);
      if (key.value === BudgetExecutionConstants.Fields.EXECUTED_AMOUNT && totalDebit.value != totalCredit.value) {
        if (showErrorTotal.value != true) {
          showErrorTotal.value = true; // Mostrar el error si se intenta guardar
          // Ocultar el error después de 3 segundos
          setTimeout(() => {
            showErrorTotal.value = false;
          }, 3000);
        }
        return;
      }
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
        supplierId: form.supplierId,
      };
      const dataVoucher = {
        retefuenteDebit: tableData.value.find((row) => row.detail === 'retefuente')?.debit ?? 0,
        retefuenteCredit: tableData.value.find((row) => row.detail === 'retefuente')?.credit ?? 0,
        reteivaDebit: tableData.value.find((row) => row.detail === 'reteiva')?.debit ?? 0,
        reteivaCredit: tableData.value.find((row) => row.detail === 'reteiva')?.credit ?? 0,
        netPayableDebit: tableData.value.find((row) => row.detail === 'neto a pagar')?.debit ?? 0,
        netPayableCredit: tableData.value.find((row) => row.detail === 'neto a pagar')?.credit ?? 0,
        equalsSumDebit: totalDebit.value,
        equalsSumCredit: totalCredit.value,
        subTotalDebit: tableData.value.find((row) => row.detail === 'subtotal')?.debit ?? 0,
        subTotalCredit: tableData.value.find((row) => row.detail === 'subtotal')?.credit ?? '-',
        excentDebit: tableData.value.find((row) => row.detail === 'excento')?.debit ?? 0,
        excentCredit: tableData.value.find((row) => row.detail === 'excento')?.credit ?? 0,
        taxedDebit: tableData.value.find((row) => row.detail === 'gravados')?.debit ?? 0,
        taxedCredit: tableData.value.find((row) => row.detail === 'gravados')?.credit ?? 0,
        dateIvaDebit: tableData.value.find((row) => row.detail === 'iva')?.debit ?? 0,
        dateIvaCredit: tableData.value.find((row) => row.detail === 'iva')?.credit ?? 0,
        convertTo: 'pdf',
        itemCode: optionsReportItems.value?.[2]?.code,
        dateProject: dayjs(form.date).format('YYYY-MM-DD HH:mm'),
        actionId: null,
        supplierId: form.supplierId,
        budgetPlanningExecutedId: props.data?.id,
        budgetPlanningIncomeId: props.dataIncomeExpense?.budgetPlanningIncomeBills?.[0]?.id,
      };
      try {
        if (valideSignatureSupplier.value) {
          await updateSignatureSuppliersService.run({ file: form.file }, selectedSupplier.value?.id);
        }
        await createOrUpdateAmountMonthBudgetExpenseExecutionService.run(dataBudget, props.data?.id);
        const res = await createOrUpdateActionsBudgetsService.run(dataAction);

        if (key.value === BudgetExecutionConstants.Fields.COMMITED_AMOUNT) {
          dataCdt.actionId = res.data?.actionsBudgets;
          await createOrUpdateBudgetCdtService.run(dataCdt);
        }
        if (key.value === BudgetExecutionConstants.Fields.EXECUTED_AMOUNT) {
          dataVoucher.actionId = res.data?.actionsBudgets;
          await createOrUpdateProofGraduationService.run(dataVoucher);
          console.log('generar ejecutado', dataVoucher);
        }
        emit('close');
      } catch (e) {
        console.error(e);
      }
    };

    return {
      t,
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
      validateSupplier,
      valideSignatureSupplier,
      sectionsForm,
      goToSectionForm,
      goToNextSectionForm,
      currentSectionForm,
      tableData,
      totalCredit,
      totalDebit,
      showErrorTotal,
      handleInput,
    };
  },
});
</script>
