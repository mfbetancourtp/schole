<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.priceOld" :label="'Presupuesto inicial anterior'">
          <input :disabled="true" class="form-control" type="text" id="priceOld" v-model="v$.form.priceOld.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.priceNew" :label="'Presupuesto inicial nuevo'">
          <input class="form-control" type="text" id="priceNew" v-model="v$.form.priceNew.$model" />
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
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import dayjs from 'dayjs';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import { BudgetExecutionConstants } from '../constant/budgetExecution.constant';

import { CreateOrUpdateInitialBudgetExecutionService } from '../services/createOrUpdateInitialBudgetExecution.service';
import { CreateOrUpdateActionsBudgetsService } from '../services/createOrUpdateActionsBudgets.service';

const createOrUpdateInitialBudgetExecutionService = new CreateOrUpdateInitialBudgetExecutionService();
const createOrUpdateActionsBudgetsService = new CreateOrUpdateActionsBudgetsService();
export default defineComponent({
  name: 'InitialBudgetIncomeExecutionForm',
  components: { AppFormModal, AppFormField, AppButton, AppUploadFile },

  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const initialBudgetTranslation = 'Presupuesto Inicial';
    const detailData = props.data?.financing_sources?.id ? `${props.data?.financing_sources?.code}` : `${props.data?.type_financing_sources?.code}`;
    const title = props.data?.initialBudget ? `core.edit ${initialBudgetTranslation} / Codigo: ${detailData}` : `core.new ${initialBudgetTranslation} / Codigo: ${detailData}`;
    console.log(props.data);
    const form = reactive({
      priceNew: props.data.initialBudget ?? null,
      priceOld: props.data.initialBudget ?? null,
      date: '',
      urlDocument: '',
      description: '',
    });
    const v$ = useVuelidate(
      {
        form: {
          priceNew: { required },
          priceOld: {},
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
      dataAction.append('tableName', BudgetExecutionConstants.Tables.BUDGET_PLANNING); // nombre de la tabla
      dataAction.append('key', BudgetExecutionConstants.Fields.INITIAL_BUDGET);
      dataAction.append('date', dayjs(form.date).format('YYYY-MM-DD HH:mm'));
      dataAction.append('priceOld', form.priceOld ?? 0);
      dataAction.append('priceNew', form.priceNew);
      dataAction.append('urlDocument', form.urlDocument);
      dataAction.append('description', form.description);
      dataAction.append('fieldAgainCreditId', 'null');

      const dataBudget = {
        initialBudget: form.priceNew,
        standardizedAccountingSystemId: props.data.standardizedAccountingSystemId,
        typeFinancingSourceId: props.data.typeFinancingSourceId,
      };
      createOrUpdateInitialBudgetExecutionService.params = {
        parentId: props.data?.parentId,
      };
      try {
        await createOrUpdateInitialBudgetExecutionService.run(dataBudget, props.data?.id);
        await createOrUpdateActionsBudgetsService.run(dataAction);
        console.log(dataAction);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
