<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.priceOld" :label="`${nameTitle} anterior`">
          <input :disabled="true" class="form-control" type="text" id="priceOld" v-model="v$.form.priceOld.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.priceNew" :label="`${nameTitle} nueva`">
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
import { defineComponent, reactive, ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import dayjs from 'dayjs';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';

import { BudgetExecutionConstants } from '../constant/budgetExecution.constant';

import { CreateOrUpdateAdditionalOrReductionBudgetExecutionService } from '../services/createOrUpdateAdditionalOrReductionBudgetExecution.service';
import { CreateOrUpdateActionsBudgetsService } from '../services/createOrUpdateActionsBudgets.service';
//import { PropsButton } from '../../../shared/components/Buttons/props.button';

const createOrUpdateAdditionalOrReductionBudgetExecutionService = new CreateOrUpdateAdditionalOrReductionBudgetExecutionService();
const createOrUpdateActionsBudgetsService = new CreateOrUpdateActionsBudgetsService();
export default defineComponent({
  name: 'AdditionalOrReductionExecutionForm',
  components: { AppFormModal, AppFormField, AppButton, AppUploadFile },

  props: {
    data: {
      type: Object,
      required: true,
    },
    detailData: {
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
    console.log(props.data);
    const title = ref('');
    const nameTitle = ref('');
    const key = ref('');
    const data: any = computed(() => props.data?.financingSourcesPeriods?.[0]);
    console.log(data.value);
    const detailData = props.detailData?.financing_sources?.id ? `${props.detailData?.financing_sources?.code}` : `${props.detailData?.type_financing_sources?.code}`;
    if (props.entity === 'additional') {
      title.value = data.value?.additional ? `core.edit Adición / Codigo: ${detailData} / ${props.data?.namePeriod}` : `core.new Adición / Codigo: ${detailData} / ${props.data?.namePeriod}`;
      nameTitle.value = 'Adición';
      key.value = BudgetExecutionConstants.Fields.ADDITIONAL;
    } else if (props.entity === 'reduction') {
      title.value = data.value?.reduction ? `core.edit Reducción / Codigo: ${detailData} / ${props.data?.namePeriod}` : `core.new Reducción / Codigo: ${detailData} / ${props.data?.namePeriod}`;
      nameTitle.value = 'Reducción';
      key.value = BudgetExecutionConstants.Fields.REDUCTION;
    }

    console.log(props.data);
    const form = reactive({
      priceOld: data.value?.[key.value] ?? null,
      priceNew: data.value?.[key.value] ?? null,
      date: '',
      urlDocument: '',
      description: '',
    });
    const rules = computed(() => ({
      form: {
        priceOld: {},
        priceNew: { required },
        date: { required },
        urlDocument: {},
        description: {},
      },
    }));
    const v$ = useVuelidate(rules, { form });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataAction = new FormData();
      dataAction.append('fieldId', data.value?.id);
      dataAction.append('tableName', BudgetExecutionConstants.Tables.FINANCING_SOURCES_PERIODS); // nombre de la tabla
      dataAction.append('key', key.value);
      dataAction.append('date', dayjs(form.date).format('YYYY-MM-DD HH:mm'));
      dataAction.append('priceOld', form.priceOld ?? 0);
      dataAction.append('priceNew', form.priceNew);
      dataAction.append('urlDocument', form.urlDocument);
      dataAction.append('description', form.description);
      dataAction.append('fieldAgainCreditId', 'null');

      const dataBudget: any = {
        budgetPlanningPeriodId: data.value?.budgetPlanningPeriodId,
        [key.value]: form.priceNew,
      };

      try {
        createOrUpdateAdditionalOrReductionBudgetExecutionService.params = {
          typeFinancingSourceId: props.detailData?.typeFinancingSourceId,
          parentId: props.detailData?.parentId,
        };
        await createOrUpdateAdditionalOrReductionBudgetExecutionService.run(dataBudget, data.value?.id);
        await createOrUpdateActionsBudgetsService.run(dataAction);
        //console.log(form, data.value?.id)
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      nameTitle,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
