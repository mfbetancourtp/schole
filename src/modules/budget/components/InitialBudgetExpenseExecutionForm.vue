<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.priceOld" :label="`${nameTitle} anterior`">
          <input :disabled="true" class="form-control" type="number" id="priceOld" v-model="v$.form.priceOld.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.priceNew" :label="`${nameTitle} nueva`">
          <input class="form-control" type="number" id="priceNew" v-model="v$.form.priceNew.$model" />
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

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import dayjs from 'dayjs';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import { BudgetExecutionConstants } from '../constant/budgetExecution.constant';

import { CreateOrUpdateInitialBudgetExpenseExecutionService } from '../services/createOrUpdateInitialBudgetExpenseExecution.service';
import { CreateOrUpdateActionsBudgetsService } from '../services/createOrUpdateActionsBudgets.service';

const createOrUpdateInitialBudgetExpenseExecutionService = new CreateOrUpdateInitialBudgetExpenseExecutionService();
const createOrUpdateActionsBudgetsService = new CreateOrUpdateActionsBudgetsService();

export default defineComponent({
  name: 'InitialBudgetExpenseExecutionForm',
  components: { AppFormModal, AppFormField, AppButton, AppUploadFile },

  props: {
    data: {
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
  },
  emits: ['close'],

  setup(props, { emit }) {
    const currentEntity = {
      titlePrefix: 'Presupuesto Inicial',
      key: BudgetExecutionConstants.Fields.INITIAL_BUDGET,
    };
    const key = computed(() => currentEntity.key);
    const detailData = computed(() => (props.data?.financing_sources?.id ? `${props.data?.financing_sources?.code}` : `${props.data?.type_financing_sources?.code}`));

    const title = computed(() => {
      const prefix = currentEntity.titlePrefix;
      return props.data?.[key.value] ? `core.edit ${prefix} / Codigo: ${detailData.value} / ${props.data?.namePeriod}` : `core.new ${prefix} / Codigo: ${detailData.value} / ${props.data?.namePeriod}`;
    });

    const nameTitle = computed(() => currentEntity.titlePrefix);

    const form = reactive({
      priceOld: props.data?.[key.value] ?? null,
      priceNew: props.data?.[key.value] ?? null,
      date: '',
      urlDocument: '',
      description: '',
    });
    const v$ = useVuelidate(
      {
        form: {
          priceOld: {},
          priceNew: { required },
          date: { required },
          urlDocument: {},
          description: {},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataAction = new FormData();
      dataAction.append('fieldId', props.data?.id);
      dataAction.append('tableName', BudgetExecutionConstants.Tables.BUDGET_PLANNING);
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
        budgetPlanningId: props.data?.id,
        [key.value]: form.priceNew,
      };
      createOrUpdateInitialBudgetExpenseExecutionService.params = {
        parentId: props.data?.parentId,
        executionOfExpenseId: props.dataExecutionOfExpense?.execution_of_expenses?.id,
      };
      try {
        await createOrUpdateInitialBudgetExpenseExecutionService.run(dataBudget, props.dataIncomeExpense?.budgetPlanningIncome?.[0]?.id);
        await createOrUpdateActionsBudgetsService.run(dataAction);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      nameTitle,
      v$,
    };
  },
});
</script>

<style scoped></style>
