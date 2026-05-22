<template>
  <form @submit.prevent="save">
    <AppLoading v-if="loading" />
    <AppFormModal v-else :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField
            :form-control="v$.form.namePeriod"
            :label="'Nombre del Período'"
          >
            <input
              class="form-control"
              type="text"
              id="namePeriod"
              v-model="v$.form.namePeriod.$model"
            />
          </AppFormField>
          <AppFormField
            :form-control="v$.form.description"
            :label="'Descripción'"
          >
            <input
              class="form-control"
              type="text"
              id="description"
              v-model="v$.form.description.$model"
            />
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, onMounted, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { CreateOrUpdateBudgetPlanningPeriodsService } from '../services/createOrUpdateBudgetPlanningPeriods.service';

const createOrUpdateBudgetPlanningPeriodsService =
  new CreateOrUpdateBudgetPlanningPeriodsService();

export default defineComponent({
  name: 'BudgetPlannignPeriodsForm',
  components: { AppFormModal, AppFormField, AppButton, AppLoading },

  props: {
    financingSystemId: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: false,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    let title = ref(`Editar período`);
    const data = props.data;

    const loading = ref(true);
    const form: any = reactive({
      namePeriod: data?.namePeriod,
      description: data?.description,
    });
    const v$ = useVuelidate(
      {
        form: {
          namePeriod: { required },
          description: {},
        },
      },
      { form }
    );
    onMounted(async () => {
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        const dataSend = {
          namePeriod: form.namePeriod,
          description: form.description,
        };
        const standardizedAccountingSystemId = props.financingSystemId;
        await createOrUpdateBudgetPlanningPeriodsService.run(
          data?.id,
          dataSend,
          standardizedAccountingSystemId
        );
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
    };
  },
});
</script>

<style scoped></style>
