<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <div>
          <div class="d-flex flex-row-reverse">
            <span>Recibo No: {{ invoiceId }}</span>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.value" :label="'Valor a pagar'">
              <input id="value" type="number" class="form-control" v-model="v$.form.value.$model"/>
            </AppFormField>

            <AppFormField :form-control="v$.form.paymentType" :label="'Medio de pago'">
              <AppAutocomplete
                v-model="v$.form.paymentType.$model"
                :options="paymentMethodsAvailable"
                :input-id="'paymentType'"
                :clearable="false"
                :label="'title'"
              ></AppAutocomplete>
            </AppFormField>
          </div>
        </div>

        <div v-if="typePaymentSelected">
          <hr>

          <!-- Message for cash payments -->
          <div v-if="typePaymentSelected == 'paymentInCash'">
            <span class="text-muted">El pago se hará en efectivo</span>
          </div>

          <!-- Message for web-checkout payments -->
          <div v-if="typePaymentSelected == 'webCheckoutPayment'">
            <span class="text-muted">El pago se hará por web-checkout con la url: {{ currentPaymentMethodAvailable?.urlWebCheckout }}</span>
          </div>

          <!-- Message for gateway payments -->
          <div v-if="typePaymentSelected == 'paymentByGateway'">
            <span class="text-muted" v-if="notPaymentGateway">
              Aún no se ha configurado una pasarela de pago, contacte con el administrador del sistema
            </span>

            <div v-else>
              <ProcessPaymentPagueATiempo
                v-if="paymentGatewayAvailableId === paymentGatewayAvailableConstant.PAGUE_A_TIEMPO"
                :process-payment="processPayment"
                :value="v$.form.value.$model"
                :invoice-id="invoiceId"
                :return-url="returnUrl"
                @form="setForm"
              ></ProcessPaymentPagueATiempo>

              <span class="text-muted" v-else>
                Se ha encontrado un error con la configuración de la pasarela de pagos, contacte con el administrador del sistema
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton 
        v-if="typePaymentSelected == 'webCheckoutPayment' && currentPaymentMethodAvailable?.urlWebCheckout"
        :href="currentPaymentMethodAvailable.urlWebCheckout"
        label="Pagar"
        :target="'_blank'"
      ></AppButton>

      <AppButton 
        v-else-if="typePaymentSelected == 'paymentInCash'"
        label="Pagar"
        @click="paymentInCash"
      ></AppButton>

      <AppButton 
        v-else-if="!notPaymentGateway"
        :disabled="!dataForm?.form?.policy"
        class="text-white"
        :label="'Pagar'"
        @click="save" 
      ></AppButton>
    </template>
  </AppFormModal>

    <!-- older version -->
    <!-- <AppPaymentGatewayManager :invoice-id="invoiceId" :value="v$.form.value.$model" :return-url="returnUrl">
      <div class="d-flex flex-row-reverse">
        <span>Recibo No: {{ invoiceId }}</span>
      </div>

      <AppFormField :form-control="v$.form.value">
        <label for="value">Valor a pagar</label>
        <input id="value" type="number" class="form-control" v-model="v$.form.value.$model"/>
      </AppFormField>
    </AppPaymentGatewayManager> -->
</template>

<script lang="ts">
import { minValue , required } from '../../plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, ref, Ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppButton from '../Buttons/AppButton.vue';
import AppFormModal from '../Modal/AppFormModal.vue';
import AppFormField from '../Forms/AppFormField.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import ProcessPaymentPagueATiempo from './ProcessPaymentPagueATiempo.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { PaymentGatewayAvailableConstant } from '../../constant/paymentGatewayAvailable.constant';

import { PaymentMethodsAvailableDto } from '../../dto/paymentGateway/paymentMethodsAvailable.dto';

import { InstitutionsService } from '../../services/institutions.service';
import { PayToInvoiceInCashService } from '../../services/payToInvoiceInCash.service';
import { GetPaymentMethodsAvailableForPaymentFormsService } from '../../services/paymentGateway/getPaymentMethodsAvailableForPaymentForms.service';

const getPaymentMethodsAvailableService = new GetPaymentMethodsAvailableForPaymentFormsService();
const payToInvoiceInCashService = new PayToInvoiceInCashService();
const institutionsService = new InstitutionsService();

export default defineComponent({
  name: 'AppRegisterPaymentInvoiceQuote',
  components: { 
    ProcessPaymentPagueATiempo,
    AppAutocomplete, 
    AppFormModal, 
    AppFormField, 
    AppLoading, 
    AppButton,
  },

  props: {
    invoiceId: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    isOfficial: {
      required: false,
      type: Number,
      default: 0,
    },
  },
  emits: ['close'],

  setup(props, {emit}) {
    const { n } = useI18n();
    const title = 'Agregar pago';
    const returnUrl = window.location.origin + '/my-quotas';
    const paymentGatewayAvailableConstant = PaymentGatewayAvailableConstant;

    const currentPaymentMethodAvailable: Ref<PaymentMethodsAvailableDto | null> = ref(null);
    const paymentMethodsAvailable: Ref<PaymentMethodsAvailableDto[]> = ref([]);
    const typePaymentSelected: Ref<String | null> = ref(null);

    const paymentGatewayAvailableId = ref();

    const notPaymentGateway = ref(false);
    const processPayment = ref(false);
    const loading = ref(false);

    const dataForm = reactive<any>({
      form: null,
      v$: null,
    });
    const form = reactive({
      value: props.value,
      paymentType: null as number | null,
    });
    const v$ = useVuelidate({
      form: {
        // value: { required, minValue: minValue(20000) },
        value: { required, minValue: minValue(1000) },
        paymentType: { required },
      },
    }, {form});

    onMounted(async () => {
      loading.value = true;

      try {
        const institution = institutionsService.getSelectedInstitution();

        if (!institution || !institution.paymentGatewayAvailableId) notPaymentGateway.value = true;
        else paymentGatewayAvailableId.value = institution.paymentGatewayAvailableId;

        paymentMethodsAvailable.value = await getPaymentMethodsAvailableService.run(props.isOfficial);
        
        if (paymentMethodsAvailable.value.length) {
          form.paymentType = paymentMethodsAvailable.value[0].id ?? null;
          currentPaymentMethodAvailable.value = paymentMethodsAvailable.value[0];

          paymentMethodSelection();
        }
      } catch (e) {console.log(e)}

      loading.value = false;
    });

    watch(() => form.paymentType, async (value) => {
      if (value) {
        currentPaymentMethodAvailable.value = paymentMethodsAvailable.value.filter((paymentMethod) => {
          return paymentMethod.id == value;
        })[0];

        paymentMethodSelection();
      }
    });

    const paymentMethodSelection = () => {
      if (!currentPaymentMethodAvailable.value) {
        typePaymentSelected.value = null;
        return;
      }

      if (
        !currentPaymentMethodAvailable.value?.urlProdPaymentGateway && 
        !currentPaymentMethodAvailable.value?.urlTestPaymentGateway && 
        !currentPaymentMethodAvailable.value?.urlWebCheckout
      ) {
        typePaymentSelected.value = 'paymentInCash';
        return;
      }

      if (currentPaymentMethodAvailable.value?.urlWebCheckout) {
        typePaymentSelected.value = 'webCheckoutPayment';
        return;
      }

      if (!currentPaymentMethodAvailable.value?.urlWebCheckout) {
        typePaymentSelected.value = 'paymentByGateway';
        return;
      }
    };

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

    const paymentInCash = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          invoiceId: parseInt(props.invoiceId),
          value: form.value,
          paymentMethodId: form.paymentType as number,
        };

        await payToInvoiceInCashService.run(dataSend);
        emit('close');
      } catch (e) {
        console.log('error', e);
        
      }
    }

    return {
      returnUrl,
      loading,
      title,
      v$,
      n,

      paymentGatewayAvailableConstant,

      currentPaymentMethodAvailable,
      paymentGatewayAvailableId,
      paymentMethodsAvailable,
      typePaymentSelected,
      notPaymentGateway,
      processPayment,
      dataForm,

      paymentInCash,
      setForm,
      save,
    };
  },
});
</script>

<style scoped>

</style>
