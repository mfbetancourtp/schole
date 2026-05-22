<template>
  <AppPaymentGatewayManager table="QUOTES" :id="data.id" :value="data.PendingValue">
    <div class="d-flex flex-row-reverse">
      <span>Recibo No: {{ data.invoiceId }}</span>
    </div>

    <p>Valor a pagar: ${{ n(data.PendingValue, 'currency') }}</p>
  </AppPaymentGatewayManager>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import {defineComponent} from 'vue';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import AppPaymentGatewayManager from '../../../shared/components/PaymentGateway/AppPaymentGatewayManager.vue';

export default defineComponent({
  name: 'PayQuotaForm',
  components: {AppPaymentGatewayManager, AppFormModal, AppFormField, AppButton},
  props: ['data'],
  emits: ['close'],
  setup(props) {
    const {n} = useI18n();

    return {
      n,
    };
  },
});
</script>

<style scoped>
</style>
