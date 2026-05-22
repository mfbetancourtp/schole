<template>
  <AppFormModal title="Método de pago">
    <template v-slot:content>
      <div class="row">
        <div class="col-12">
          <span>Valor a pagar: </span>
          <h2>{{ n(total, 'currency') }}</h2>
        </div>
        <div class="col-12">
          <AppFormField>
            <label for="paymentMethod">Método de pago</label>
            <select id="paymentMethod" class="form-select" placeholder="Seleccione..." v-model="paymentMethod">
              <option v-for="(method, index) in paymentMethods" :value="method" :key="index">{{ method }}</option>
            </select>
          </AppFormField>
        </div>
      </div>

      <template v-if="paymentMethod === DEFAULT_METHOD_CREDIT">
        <div class="row">
          <div class="col-12 mb-2">
            <hr>
            <h3 class="lead">Acuerdo de pago</h3>
          </div>
          <div class="col-12 col-md-6">
            <AppFormField>
              <label for="initialFee">Cuota inicial</label>
              <input id="initialFee" type="number" v-model="initialFee" class="form-control">
            </AppFormField>
          </div>
          <div class="col-12 col-md-6">
            <span class="tw-text-right">Saldo a financiar:</span>
            <h3 class="h4">{{ n(balance, 'currency') }}</h3>
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md-3">
            <AppFormField>
              <label for="term">Cuotas</label>
              <select id="term" class="form-select" v-model="term">
                <option v-for="t in terms" :value="t">{{ t }}</option>
              </select>
            </AppFormField>
          </div>

          <div class="col-12 col-md-5">
            <span>Valor de la cuota:</span>
            <h3 class="h4">{{ n(feeValue, 'currency') }}</h3>
          </div>

          <div class="col-12 col-md-3">
            <AppFormField>
              <label for="payDay">Día de pago</label>
              <select id="payDay" class="form-select" v-model="payDay">
                <option v-for="pd in payDays" :value="pd">{{ pd }}</option>
              </select>
            </AppFormField>
          </div>
        </div>
      </template>
    </template>
    <template v-slot:actions>
      <AppButton  @click="toPay">
        Pagar
      </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRouter} from 'vue-router';

import AppBreadCrumbs from '../../../shared/components/AppBreadCrumbs.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {PaymentRegisterService} from '../services/paymentRegister.service';

const paymentRegisterService = new PaymentRegisterService();

export default defineComponent({
  name: 'RegisterPayment',
  components: {AppButton, AppFormModal, AppBreadCrumbs, AppFormField},
  props: ['total'],
  emits: ['close'],
  setup({total}, {emit}) {
    const DEFAULT_METHOD_CREDIT = 'Crédito';
    const DEFAULT_METHOD_COUNTED = 'Contado';

    const term = ref(6);
    const initialFee = ref(0);
    const payDay = ref(5);
    const feeValue = computed(() => Math.ceil(balance.value / term.value));
    const balance = computed(() => total - initialFee.value);
    const paymentMethod = ref(DEFAULT_METHOD_COUNTED);
    const loading = ref(false);
    const {n} = useI18n();
    const router = useRouter();

    const paymentMethods = [
      DEFAULT_METHOD_COUNTED,
      DEFAULT_METHOD_CREDIT,
    ];

    const terms = [
      3, 6, 12,
    ];

    const payDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

    const toPay = async () => {
      loading.value = true;
      try {
        await paymentRegisterService.run({
          invoice: {
            isCredit: paymentMethod.value === DEFAULT_METHOD_CREDIT,
            isQuote: false,
            totalPaid: paymentMethod.value === DEFAULT_METHOD_CREDIT ? initialFee.value : total,
          },
          quotes: paymentMethod.value === DEFAULT_METHOD_CREDIT ? term.value : null,
          valueQuote: paymentMethod.value === DEFAULT_METHOD_CREDIT ? feeValue.value : null,
          payDay: paymentMethod.value === DEFAULT_METHOD_CREDIT ? payDay.value : null,
        });
        await emit('close');
        await router.push('/shopping');
      } catch (e) {
      }
      loading.value = false;
    };

    return {
      paymentMethods,
      total,
      initialFee,
      feeValue,
      terms,
      term,
      paymentMethod,
      DEFAULT_METHOD_CREDIT,
      balance,
      payDay,
      payDays,
      n,
      loading,
      toPay,
    };
  },
});
</script>

<style scoped>

</style>
