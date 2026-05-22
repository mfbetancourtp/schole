<template>
  <div class="d-flex flex-column">
    <!--    <AppFormField :form-control="v$.form.paymentMethod">
          <label for="paymentMethoId">Método de pago</label>
          <AppSelect v-model="v$.form.paymentMethod.$model" placeholder="Seleccione un método de pago">
            <option v-for="paymentMethod in paymentMethods" :value="paymentMethod.id">
              {{ paymentMethod.name }}
            </option>
          </AppSelect>
        </AppFormField>-->

    <AppFormField :form-control="v$.form.policy">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" id="checkPolicyPagoATiempo"
               v-model="v$.form.policy.$model">
        <label class="form-check-label" for="checkPolicyPagoATiempo">
          Acepto los términos y condiciones de uso y la política de privacidad y tratamiento de datos personales de
          Pagueatiempo.com como pasarela para el procesamiento del pago que estoy a punto de iniciar. Esta política
          puede
          ser consultada en
          <!-- Por favor realizar el respectivo pago y adjuntar el pantallazo de la consignación en el siguientes paso. -->
          <a href="https://pagueatiempo.com/legal" target="_blank">https://pagueatiempo.com/legal</a>
        </label>
      </div>
    </AppFormField>

    <form v-if="processPaymentPage" method="POST" :action="processPaymentPage.url_procesamiento" ref="formProcessPayment"
          id="processForm">
      <input type="hidden" name="metodo_pago" v-model="v$.form.paymentMethod.$model">
      <input type="hidden" name="token" :value="processPaymentPage.token">
      <input type="hidden" name="nit_comercio" :value="processPaymentPage.nit">
      <input type="hidden" name="valor" :value="processPaymentPage.value">
      <input type="hidden" name="iva" :value="processPaymentPage.iva">
      <input type="hidden" name="moneda" :value="processPaymentPage.currency">
      <input type="hidden" name="numero_orden" :value="processPaymentPage.orderNumber">
      <input type="hidden" name="url_notificacion_resultado" :value="processPaymentPage.responseUrl">
      <input type="hidden" name="url_retorno_comercio" :value="returnUrl">
      <input type="hidden" name="json_params" :value="JSON.stringify({ ...processPaymentPage.params, params })">
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref, watch} from 'vue';
import {useVuelidate} from '@vuelidate/core';

import AppFormField from '../Forms/AppFormField.vue';

import {
  ProcessPaymentService,
} from '../../services/paymentGateway/pagueATiempo/processPayment.service';
import {ProcessPaymentDto} from '../../dto/paymentGateway/pagueATiempo/processPayment.dto';
import {
  RelatedDataProcessPaymentService,
} from '../../services/paymentGateway/pagueATiempo/relatedDataProcessPayment.service';
import {required} from '../../plugins/vuelidate.plugin';

const processPaymentService = new ProcessPaymentService();
const relatedDataProcessPaymentService = new RelatedDataProcessPaymentService();

export default defineComponent({
  name: 'ProcessPaymentPagueATiempo',
  components: { AppFormField},
  emits: ['form'],
  props: {
    value: {
      required: true,
      type: Number,
    },
    invoiceId: {
      required: false,
      type: String,
    },
    processPayment: {
      required: true,
      type: Boolean,
    },
    returnUrl: {
      required: true,
      type: String,
    },
    params: {
      required: true,
      type: Object,
    },
  },
  setup(props, {emit}) {
    const paymentMethods = ref();
    const formProcessPayment = ref();

    const form = reactive({
      paymentMethod: null,
      policy: false,
      // policy: true,
    });

    const processPaymentPage = ref<ProcessPaymentDto>();

    const v$ = useVuelidate({
      form: {
        paymentMethod: {},
        policy: {required},
      },
    }, {form});

    onMounted(async () => {
      const response = await relatedDataProcessPaymentService.run();

      paymentMethods.value = response.paymentMethods;
      emit('form', {form, v$});
    });

    watch(() => props.processPayment, async (value) => {
      if (value) {
        processPaymentPage.value = await processPaymentService.run({
          value: props.value.toFixed(2),
          iva: 0,
          currency: 'COP',
          invoiceId: props.invoiceId?.toString(),
        });

        setTimeout(() => {
          formProcessPayment.value.submit();
        }, 500);
      }
    });

    return {
      v$,
      paymentMethods,
      processPaymentPage,
      formProcessPayment,
    };
  },
});
</script>

<style scoped>

</style>
