<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>
        <template v-else>
          <AppFormField :form-control="v$.form.bankId" :label="t('core.bankAccount')">
            <AppAutocomplete v-model="v$.form.bankId.$model" :input-id="'bankId'" :options="optionsBank"> </AppAutocomplete>
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
import { defineComponent, reactive, onMounted, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { GetAllBankAccountService } from '../services/getAllBankAccount.service';
import { CreateOrUpdateAssociateAccountsService } from '../services/createOrUpdateAssociateAccounts.service';

const getAllBankAccountService = new GetAllBankAccountService();
const createOrUpdateAssociateAccountsService = new CreateOrUpdateAssociateAccountsService();

export default defineComponent({
  name: 'AssociateAccountsForm',
  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppButton,
    AppLoading,
  },

  props: ['incomeBill', 'financingSystemId'],
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    let title = 'Asociar Cuenta ';
    //    const data = props.data ?? null;
    const optionsBank = ref();
    const loading = ref(true);

    const form = reactive({
      bankId: props.incomeBill.bankId,
    });

    const v$ = useVuelidate(
      {
        form: {
          bankId: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        console.log(props.incomeBill);
        optionsBank.value = await getAllBankAccountService.run(props.financingSystemId);
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateAssociateAccountsService.run(form, props.incomeBill.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      optionsBank,
      title,
      save,
      t,
      v$,
      emit,
      loading,
    };
  },
});
</script>
