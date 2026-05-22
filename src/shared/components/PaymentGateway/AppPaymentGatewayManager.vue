<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <span class="text-muted" v-if="notPaymentGateway">
        Aún no se ha configurado una pasarela de pago, contacte con el administrador del sistema
      </span>
      <div v-else>
        <slot></slot>

        <ProcessPaymentPagueATiempo
            v-if="paymentGatewayAvailableId === paymentGatewayAvailableConstant.PAGUE_A_TIEMPO"
            :invoice-id="invoiceId"
            :value="value"
            :process-payment="processPayment"
            @form="setForm"
            :return-url="returnUrl"></ProcessPaymentPagueATiempo>
        <span class="text-muted" v-else>
          Se ha encontrado un error con la configuración de la pasarela de pagos, contacte con el administrador del sistema
        </span>
      </div>
    </template>

    <template #actions>
      <AppButton @click="save" v-if="!notPaymentGateway">
        Pagar
      </AppButton>
    </template>

  </AppFormModal>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';

import AppFormModal from '../Modal/AppFormModal.vue';
import ProcessPaymentPagueATiempo from './ProcessPaymentPagueATiempo.vue';
import AppButton from '../Buttons/AppButton.vue';

import {InstitutionsService} from '../../services/institutions.service';
import {PaymentGatewayAvailableConstant} from '../../constant/paymentGatewayAvailable.constant';

const institutionsService = new InstitutionsService();

export default defineComponent({
  name: 'PaymentGatewayManager',
  components: {AppButton, AppFormModal, ProcessPaymentPagueATiempo},
  props: {
    invoiceId: {
      type: String,
    },
    returnUrl: {
      required: true,
      type: String,
    },
    value: {
      required: true,
      type: Number,
    },
  },
  setup() {
    const title = 'Agregar pago';
    const notPaymentGateway = ref(false);
    const paymentGatewayAvailableConstant = PaymentGatewayAvailableConstant;
    const paymentGatewayAvailableId = ref();
    const validFromGateway = ref(false);
    const processPayment = ref(false);
    const dataForm = reactive<any>({
      form: null,
      v$: null,
    });

    onMounted(() => {
      const institution = institutionsService.getSelectedInstitution();

      if (!institution || !institution.paymentGatewayAvailableId) {
        notPaymentGateway.value = true;
      } else {
        paymentGatewayAvailableId.value = institution.paymentGatewayAvailableId;
      }
    });

    const setForm = (data: { form: any, v$: any }) => {
      dataForm.form = data.form;
      dataForm.v$ = data.v$;
    };

    const save = async () => {
      if (!dataForm.v$ && !dataForm.form) return;
      const isValid = await dataForm.v$.$validate();
      if (!isValid) return;

      processPayment.value = true;
    };

    return {
      title,
      notPaymentGateway,
      paymentGatewayAvailableId,
      paymentGatewayAvailableConstant,
      validFromGateway,
      processPayment,
      save,
      setForm,
    };
  },
});
</script>

<style scoped>

</style>
