<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>
        <template v-else>
          <AppFormField :form-control="v$.form.priceOld" :label="`${nameTitle} anterior`">
            <input :disabled="true" class="form-control" type="number" id="priceOld" v-model="v$.form.priceOld.$model" />
          </AppFormField>
          <AppFormField :form-control="v$.form.priceNew" :label="`${nameTitle} nueva`">
            <input class="form-control" type="number" id="priceNew" v-model="v$.form.priceNew.$model" />
          </AppFormField>
          <AppFormField v-if="isValidCredit" :form-control="v$.form.itemExpense" label="Selecciona la cuenta del contracrédito">
            <AppAutocomplete v-model="v$.form.itemExpense.$model" :options="optionsExpenses" :clearable="false" :reduce="(d: any) => d.financingSourcePeriodId"></AppAutocomplete>
          </AppFormField>
          <AppFormField :form-control="v$.form.date" :label="'Fecha y hora'">
            <input class="form-control" type="datetime-local" id="date" v-model="v$.form.date.$model" />
          </AppFormField>
          <AppFormField :form-control="v$.form.urlDocument" :label="'Documento de respaldo'">
            <AppUploadFile v-model="v$.form.urlDocument.$model" input-id="urlDocument"></AppUploadFile>
          </AppFormField>
          <AppFormField :form-control="v$.form.description" :label="'Descripción'">
            <input class="form-control" type="text" id="description" v-model="v$.form.description.$model" />
          </AppFormField>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, computed, onMounted, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import dayjs from 'dayjs';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import { BudgetExecutionConstants } from '../constant/budgetExecution.constant';

import { CreateOrUpdateAdditionalOrReductionBudgetExpenseExecutionService } from '../services/createOrUpdateAdditionalOrReductionBudgetExpenseExecution.service';
import { CreateOrUpdateActionsBudgetsService } from '../services/createOrUpdateActionsBudgets.service';
import { GetBudgetExpenseItemsService } from '../services/getBudgetExpenseItems.service';

const createOrUpdateAdditionalOrReductionBudgetExpenseExecutionService = new CreateOrUpdateAdditionalOrReductionBudgetExpenseExecutionService();
const createOrUpdateActionsBudgetsService = new CreateOrUpdateActionsBudgetsService();
const getBudgetExpenseItemsService = new GetBudgetExpenseItemsService();

/*const createOrUpdateAdditionalOrReductionBudgetExecutionService =
  new CreateOrUpdateAdditionalOrReductionBudgetExecutionService();
const createOrUpdateActionsBudgetsService =
  new CreateOrUpdateActionsBudgetsService();*/

export default defineComponent({
  name: 'AdditionalOrReductionExecutionForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppUploadFile,
    AppAutocomplete,
    AppLoading,
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
    dataExecutionOfExpense: {
      type: Object,
      required: true,
    },
    entity: {
      type: String,
      required: true,
      validator: (value: string) => ['additional', 'reduction', 'credit', 'againstCredit'].includes(value),
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    // Configuración de entidades
    const entityConfig: any = {
      additional: {
        titlePrefix: 'Adición',
        key: BudgetExecutionConstants.Fields.ADDITIONAL,
      },
      reduction: {
        titlePrefix: 'Reducción',
        key: BudgetExecutionConstants.Fields.REDUCTION,
      },
      credit: {
        titlePrefix: 'Credito',
        key: BudgetExecutionConstants.Fields.CREDIT,
      },
      againstCredit: {
        titlePrefix: 'Contra credito',
        key: BudgetExecutionConstants.Fields.AGAINST_CREDIT,
      },
      // Agregar más entidades según sea necesario...
    };

    // Datos y propiedades computadas
    const currentEntity = computed(() => entityConfig[props.entity] || {});
    const key = computed(() => currentEntity.value.key);
    const data = computed(() => props.data?.financingSourcesPeriods?.[0]);
    const detailData = computed(() => (props.detailData?.financing_sources?.id ? `${props.detailData?.financing_sources?.code}` : `${props.detailData?.type_financing_sources?.code}`));
    const optionsExpenses = ref([]);
    const loading = ref(true);
    const title = computed(() => {
      const prefix = currentEntity.value.titlePrefix;
      return data.value?.[key.value] ? `core.edit ${prefix} / Codigo: ${detailData.value} / ${props.data?.namePeriod}` : `core.new ${prefix} / Codigo: ${detailData.value} / ${props.data?.namePeriod}`;
    });

    const nameTitle = computed(() => currentEntity.value.titlePrefix);
    const isValidCredit = computed(() => key.value === entityConfig['credit'].key);

    // Formulario reactivo
    const form = reactive({
      priceOld: data.value?.[key.value] ?? null,
      priceNew: data.value?.[key.value] ?? null,
      date: '',
      urlDocument: '',
      description: '',
      itemExpense: null,
    });
    // Reglas de validación
    const rules = computed(() => ({
      form: {
        priceOld: {},
        priceNew: { required },
        date: { required },
        urlDocument: {},
        description: {},
        itemExpense: isValidCredit.value ? { required } : {},
      },
    }));
    const v$ = useVuelidate(rules, { form });
    onMounted(async () => {
      if (isValidCredit.value) {
        const params = {
          budgetPlanningPeriodId: data.value?.budgetPlanningPeriodId,
          budgetPlanningId: props.dataIncomeExpense?.budgetPlanningIncome?.[0]?.id,
          executionOfExpenseId: props.dataExecutionOfExpense?.execution_of_expenses?.id,
        };
        optionsExpenses.value = await getBudgetExpenseItemsService.run(params);
        console.log(optionsExpenses.value);
      }
      loading.value = false;
    });
    // Guardar formulario
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataAction = new FormData();
      dataAction.append('fieldId', data.value?.id);
      dataAction.append('tableName', BudgetExecutionConstants.Tables.FINANCING_SOURCES_PERIODS);
      dataAction.append('key', key.value);
      dataAction.append('date', dayjs(form.date).format('YYYY-MM-DD HH:mm'));
      dataAction.append('priceOld', form.priceOld ?? 0);
      dataAction.append('priceNew', form.priceNew);
      dataAction.append('urlDocument', form.urlDocument);
      dataAction.append('description', form.description);
      dataAction.append('parentId', 'null');
      dataAction.append('executionOfExpenseId', props.dataExecutionOfExpense?.execution_of_expenses?.id);

      const dataBudget = {
        budgetPlanningPeriodId: data.value?.budgetPlanningPeriodId ?? null,
        budgetPlanningId: props.dataIncomeExpense?.budgetPlanningIncome?.[0]?.id ?? null,
        [key.value]: form.priceNew,
      };
      createOrUpdateAdditionalOrReductionBudgetExpenseExecutionService.params = {
        parentId: props.detailData?.parentId,
        executionOfExpenseId: props.dataExecutionOfExpense?.execution_of_expenses?.id,
      };
      if (isValidCredit.value) {
        //const itemExpenseValue = String(form.itemExpense);
        dataAction.append('fieldAgainCreditId', form.itemExpense ?? '');
        createOrUpdateAdditionalOrReductionBudgetExpenseExecutionService.params = {
          ...createOrUpdateAdditionalOrReductionBudgetExpenseExecutionService.params, // Mantener los valores previos
          financingSourcePeriodAgainId: form.itemExpense,
        };
      } else {
        dataAction.append('fieldAgainCreditId', 'null');
      }

      try {
        await createOrUpdateAdditionalOrReductionBudgetExpenseExecutionService.run(dataBudget, data.value?.id);
        await createOrUpdateActionsBudgetsService.run(dataAction);
        emit('close');
      } catch (e) {
        console.error(e);
      }
    };

    return {
      title,
      loading,
      nameTitle,
      save,
      v$,

      key,
      entityConfig,
      optionsExpenses,
      isValidCredit,
    };
  },
});
</script>

<style scoped></style>
