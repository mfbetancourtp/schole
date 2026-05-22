<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.requiredDate" label="Fecha">
              <input type="date" class="form-control" v-model="v$.form.requiredDate.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.budgetCategoryId" label="Concepto">
              <AppAutocomplete :options="conceptsList" v-model="v$.form.budgetCategoryId.$model" />
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.description" label="Detalle">
            <input type="text" class="form-control" v-model="v$.form.description.$model" />
          </AppFormField>

          <div class="form-row">
            <AppFormField :form-control="v$.form.budgetAmount" label="Cantidad">
              <input type="number" class="form-control" v-model="v$.form.budgetAmount.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.budgetUnitValue" label="Valor Unitario">
              <input type="number" class="form-control" v-model="v$.form.budgetUnitValue.$model" />
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.budgetTotalValue" label="Subtotal">
            <input disabled type="number" class="form-control" v-model="v$.form.budgetTotalValue.$model" />
          </AppFormField>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetBudgetCategoriesService } from '../services/getBudgetCategories.service';
import { CreateOrUpdatePlanningWeekBudgetsService } from '../services/createOrUpdatePlanningWeekBudgets.service';

const createOrUpdatePlanningWeekBudgetsService = new CreateOrUpdatePlanningWeekBudgetsService();
const getBudgetCategoriesService = new GetBudgetCategoriesService();

export default defineComponent({
  name: 'CourseSchedulePWFormBudgetForm',
  components: {
    AppAutocomplete,
    AppFormModal,
    AppFormField,
    AppLoading,
    AppButton,
  },

  props: {
    data: {
      type: Object as PropType<any | null>,
    },
    planningWeekId: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const title = props.data?.id ? 'Editar Presupuesto' : 'Agregar Presupuesto';

    const conceptsList: Ref<any[]> = ref([]);

    const loading = ref(true);

    const form: any = reactive({
      requiredDate: props.data?.dates ?? null,
      budgetCategoryId: null,
      description: props.data?.detail ?? null,
      budgetAmount: props.data?.amount ?? null,
      budgetUnitValue: props.data?.unitValue ?? null,
      budgetTotalValue: props.data?.subTotal ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          requiredDate: { required },
          budgetCategoryId: { required },
          description: { required },
          budgetAmount: { required },
          budgetUnitValue: { required },
          budgetTotalValue: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      conceptsList.value = await getBudgetCategoriesService.run();

      if (props.data?.id && props.data?.concept) {
        const conceptAux = conceptsList.value.filter((item) => item.name == props.data.concept)[0];

        form.budgetCategoryId = conceptAux ? conceptAux.id : null;
      }

      loading.value = false;
    });

    watch(
      () => form.budgetUnitValue,
      (value) => {
        if (value) {
          form.budgetTotalValue = form.budgetAmount * value;
        }
      }
    );
    watch(
      () => form.budgetAmount,
      () => {
        if (form.budgetUnitValue) {
          form.budgetTotalValue = form.budgetAmount * form.budgetUnitValue;
        }
      }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          requiredDate: form.requiredDate,
          budgetCategoryId: form.budgetCategoryId,
          description: form.description,
          budgetAmount: form.budgetAmount,
          budgetUnitValue: form.budgetUnitValue,
          budgetTotalValue: form.budgetTotalValue,
          planningWeekId: props.planningWeekId,
        };

        await createOrUpdatePlanningWeekBudgetsService.run(dataSend, props.data?.id);

        emit('close');
      } catch (error) {
        console.log('This is error', error);
      }
    };
    return {
      loading,
      title,
      v$,

      conceptsList,

      save,
    };
  },
});
</script>
