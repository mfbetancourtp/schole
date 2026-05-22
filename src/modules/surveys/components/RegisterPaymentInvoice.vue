<template>
  <AppFormModal title="Registrar pago">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <div class="row">
          <div class="col-12">
            <span>Valor a pagar: </span>

            <h2>{{ n(total, 'currency') }}</h2>
          </div>

          <div class="col-12">
            <AppFormField :form-control="v$.form.paymentMethod" :label="'Método de financiación'">
              <AppAutocomplete
                v-model="v$.form.paymentMethod.$model"
                :input-id="'paymentMethod'"
                :options="paymentMethods"
                :clearable="false"
                :label="'id'"
              ></AppAutocomplete>
            </AppFormField>
          </div>
        </div>

        <template v-if="v$.form.paymentMethod.$model === DEFAULT_METHOD_CREDIT.id">
          <div class="row">
            <div class="col-12 mb-2">
              <hr>

              <h3 class="lead">Acuerdo de pago</h3>
            </div>

            <div class="col-12 col-md-6">
              <AppFormField :form-control="v$.form.initialFee" :label="'Cuota inicial'">
                <input class="form-control" id="initialFee" type="number" v-model="v$.form.initialFee.$model">
              </AppFormField>
            </div>

            <div class="col-12 col-md-6">
              <span class="tw-text-right">Saldo a financiar:</span>

              <h3 class="h4">{{ n(balance, 'currency') }}</h3>
            </div>
          </div>

          <div class="row">
            <div class="col-12 col-md-3">
              <AppFormField :form-control="v$.form.term" :label="'Cuotas'">
                <AppAutocomplete
                  v-model="v$.form.term.$model"
                  :clearable="false"
                  :input-id="'term'"
                  :options="terms"
                  :label="'id'"
                ></AppAutocomplete>
              </AppFormField>
            </div>

            <div class="col-12 col-md-5">
              <span>Valor de la cuota:</span>

              <h3 class="h4">{{ n(feeValue, 'currency') }}</h3>
            </div>

            <div class="col-12 col-md-3">
              <AppFormField :form-control="v$.form.payDay" :label="'Día de pago'">
                <AppAutocomplete
                  v-model="v$.form.payDay.$model"
                  :input-id="'payDay'"
                  :clearable="false"
                  :options="payDays"
                  :label="'id'"
                ></AppAutocomplete>
              </AppFormField>
            </div>
          </div>
        </template>

        <span class="text-muted">
          Por favor realizar el respectivo pago y adjuntar el pantallazo de la consignación en el siguientes paso.
        </span>

        <br>
        <br>

        <span 
          class="text-muted" 
          v-html="linkifyHtml(textWebChecOut ?? '', {target: '_blank'})"
        ></span>
      </div>
    </template>

    <template #actions>
      <AppButton 
        @click="payStepTypeCharge"
        label="Pagar"
      ></AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { required, requiredIf, minValue, maxValue } from '../../../shared/plugins/vuelidate.plugin';
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import linkifyHtml from 'linkify-html';
import * as linkify from 'linkifyjs';
import { useI18n } from 'vue-i18n';

import AppLoading from "../../../shared/components/AppLoading.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { PostPaymentsConvocationsInvoicesService } from '../services/postPaymentsConvocationsInvoices.service';

const postPaymentsConvocationsInvoicesService = new PostPaymentsConvocationsInvoicesService();

export default defineComponent({
  name: 'RegisterPaymentInvoice',
  components: { AppFormModal, AppFormField, AppButton, AppAutocomplete, AppLoading },

  props: {
    total: {
      required: true,
      type: Number,
    },
    service: {
      required: true,
      type: Object,
    },
    returnUrl: {
      required: true,
      type: String,
    },
    extraParams: {
      required: false,
      type: Object,
    },
    allowCreditMethod: {
      required: false,
      type: Boolean,
      default: true,
    },
    minInitialFee: {
      required: false,
      type: Number,
      default: 0,
    },
    maxTerm: {
      required: false,
      type: Number,
      default: 12,
    },
  },
  emits: ['paymentCompleted'],

  setup({total, extraParams, allowCreditMethod, minInitialFee, maxTerm}, {emit}) {
    const { n } = useI18n();

    const textWebChecOut = 'Si al momento de pagar no te redirigió a la interfaz de pago por favor hacer click en el siguiente link https://www.zonapagos.com/t_Liceomoderno/pagos.asp';
    const DEFAULT_METHOD_COUNTED = { id: 'Contado' };
    const DEFAULT_METHOD_CREDIT = { id: 'Crédito' };
    const paymentMethods = [DEFAULT_METHOD_COUNTED];
    const payDays: { id: number }[] = [];
    const terms: { id: number }[] = [];

    const params = ref(extraParams);
    
    const loading = ref(true);

    const feeValue = computed(() => Math.ceil(balance.value / form.term));
    const balance = computed(() => total - form.initialFee);

    const form = reactive({
      paymentMethod: DEFAULT_METHOD_COUNTED.id,
      initialFee: minInitialFee,
      term: 2,
      payDay: 5,
    });
    const v$ = useVuelidate({
      form: {
        paymentMethod: {required},
        initialFee: {
          requiredIf: requiredIf(() => {
            return form.paymentMethod === DEFAULT_METHOD_CREDIT.id;
          }),
          minValue: minValue(minInitialFee),
        },
        term: {
          requiredIf: requiredIf(() => {
            return form.paymentMethod === DEFAULT_METHOD_CREDIT.id;
          }),
          maxValue: maxValue(maxTerm ?? 12),
          minValue: minValue(2),
        },
        payDay: {
          requiredIf: requiredIf(() => {
            return form.paymentMethod === DEFAULT_METHOD_CREDIT.id;
          }),
        },
      },
    }, {form});

    onMounted(() => {
      loading.value = true;

      try {
        if (allowCreditMethod) {
          paymentMethods.push(DEFAULT_METHOD_CREDIT);
        }

        for (let i = 2; i <= maxTerm; i++) {terms.push({id: i })}
        for (let i = 1; i <= 30; i++) {payDays.push({id: i })}
      } catch (e) {console.log(e)}

      loading.value = false;
    });

    const payStepTypeCharge = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        const paramsDataSend = params.value?.dataSend;

        const dataSend = {
          id: paramsDataSend.id,
          convocationEnrolId: paramsDataSend.convocationEnrolId,
          convocationStepId: paramsDataSend.convocationStepId,
          convocationEnrolStepId: paramsDataSend.convocationEnrolStepId,
          quotes: form.paymentMethod === DEFAULT_METHOD_CREDIT.id ? form.term : null,
          valueQuote: form.paymentMethod === DEFAULT_METHOD_CREDIT.id ? feeValue.value : null,
          payDay: form.paymentMethod === DEFAULT_METHOD_CREDIT.id ? form.payDay : null,
          totalPaid: 0,
          totalDiscount: paramsDataSend.totalDiscount,
          isCredit: form.paymentMethod === DEFAULT_METHOD_CREDIT.id ? 1 : 0,
          details: [ ...paramsDataSend.details ]
        };

        await postPaymentsConvocationsInvoicesService.run(dataSend);

        // await window.open('https://www.zonapagos.com/t_Liceomoderno/pagos.asp', '_blank');
        await window.open('https://www.zonapagos.com/t_Liceomoderno/pagos.asp');

        // setInterval(async () => {
        //   location.reload();
        // }, 5000);

      } catch (e) {console.log('err', e)}
    };

    return {
      loading,
      v$,
      n,
      
      DEFAULT_METHOD_CREDIT,
      paymentMethods,
      textWebChecOut,
      feeValue,
      balance,
      payDays,
      total,
      terms,

      payStepTypeCharge,

      linkifyHtml,
      linkify,
    };
  },
});
</script>

<style scoped>
</style>
