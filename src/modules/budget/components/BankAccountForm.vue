<template>
  <form @submit.prevent="save">
    <AppLoading v-if="loading" />
    <AppFormModal v-else :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField
            :form-control="v$.form.name"
            :label="'Nombre del banco'"
          >
            <input
              class="form-control"
              type="text"
              id="name"
              v-model="v$.form.name.$model"
            />
          </AppFormField>
          <AppFormField
            :form-control="v$.form.numberAccount"
            :label="'Número de cuenta'"
          >
            <input
              class="form-control"
              type="text"
              id="numberAccount"
              v-model="v$.form.numberAccount.$model"
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

import { CreateOrUpdateBankAccountService } from '../services/createOrUpdateBankAccount.service';

const createOrUpdateBankAccountService =
  new CreateOrUpdateBankAccountService();

export default defineComponent({
  name: 'BankAccountForm',
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
    const data = props.data;
let title = ref(data?.id ? `Editar cuenta - ${data?.name}` : "Crear nueva cuenta");


    const loading = ref(true);
    const form: any = reactive({
      id: data?.id,
      name: data?.name,
      numberAccount: data?.numberAccount,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          numberAccount: { required },
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
          id: form?.id,
          name: form.name,
          numberAccount: form.numberAccount,
          standardizedAccountingSystemId: props.financingSystemId
        };
        await createOrUpdateBankAccountService.run(
          dataSend, data?.id
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
