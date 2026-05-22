<template>
  <AppFormModal title="Registrar pago" @closed="emit('close')">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <div class="row">
          <div class="col-12">
            <span>Valor a pagar: </span>

            <h2>{{ n(total, 'currency') }}</h2>
          </div>

          <div v-if="showPaymentSelectionFields" class="form-row">
            <AppFormField :form-control="v$.form.paymentMethod" :label="'Método de financiación'">
              <select id="paymentMethod" class="form-select" placeholder="Seleccione..." v-model="v$.form.paymentMethod.$model">
                <option v-for="(method, index) in paymentMethods" :value="method" :key="index">
                  {{ method }}
                </option>
              </select>
            </AppFormField>

            <AppFormField :form-control="v$.form.paymentType" :label="'Medio de pago'">
              <AppAutocomplete v-model="v$.form.paymentType.$model" :options="paymentMethodsAvailable" :input-id="'paymentType'" :clearable="false" :label="'title'"></AppAutocomplete>
            </AppFormField>
          </div>

          <div v-else class="app-register-payment-invoice__selectionSummary">
            <div class="app-register-payment-invoice__selectionItem">
              <span>Método de financiación</span>
              <strong>{{ form.paymentMethod }}</strong>
            </div>

            <div class="app-register-payment-invoice__selectionItem">
              <span>Medio de pago</span>
              <strong>{{ selectedPaymentTypeLabel }}</strong>
            </div>
          </div>
        </div>

        <template v-if="v$.form.paymentMethod.$model === DEFAULT_METHOD_CREDIT">
          <div class="row">
            <div class="col-12 mb-2">
              <hr />
              <h3 class="lead">Acuerdo de pago</h3>
            </div>

            <div class="col-12 col-md-6">
              <AppFormField :form-control="v$.form.initialFee" :label="'Cuota inicial'">
                <input id="initialFee" type="number" v-model="v$.form.initialFee.$model" class="form-control" />
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
                <select id="term" class="form-select" v-model="v$.form.term.$model">
                  <option v-for="(term, index) in terms" :key="index" :value="term">
                    {{ term }}
                  </option>
                </select>
              </AppFormField>
            </div>

            <div class="col-12 col-md-5">
              <span>Valor de la cuota:</span>
              <h3 class="h4">{{ n(feeValue, 'currency') }}</h3>
            </div>

            <div class="col-12 col-md-3">
              <AppFormField :form-control="v$.form.payDay" :label="'Día de pago'">
                <select id="payDay" class="form-select" v-model="v$.form.payDay.$model">
                  <option v-for="(pd, index) in payDays" :key="index" :value="pd">
                    {{ pd }}
                  </option>
                </select>
              </AppFormField>
            </div>
          </div>
        </template>

        <template v-if="typePaymentSelected">
          <hr />

          <!-- Message for cash payments -->
          <div v-if="typePaymentSelected == 'paymentInCash'">
            <span class="text-muted">El pago se hará en efectivo</span>
            <hr />

            <AppFormField :form-control="v$.form.isFile">
              <label for="contentPdf">Comprobante de Pago</label>
              <div class="form-check form-switch">
                <AppUploadFile v-model="v$.form.isFile.$model" @update:modelValue="toUploadEvidence"> </AppUploadFile>
              </div>
            </AppFormField>
          </div>

          <!-- Message for web-checkout payments -->
          <div v-if="typePaymentSelected == 'webCheckoutPayment'">
            <span class="text-muted">El pago se hará por web-checkout con la url: {{ currentPaymentMethodAvailable?.urlWebCheckout }}</span>
            <hr />

            <AppFormField :form-control="v$.form.isFile">
              <label for="contentPdf">Comprobante de Pago</label>
              <div class="form-check form-switch">
                <AppUploadFile v-model="v$.form.isFile.$model" @update:modelValue="toUploadEvidence"> </AppUploadFile>
              </div>
            </AppFormField>
          </div>

          <!-- Message for gateway payments -->
          <div v-if="typePaymentSelected == 'paymentByGateway'">
            <span class="text-muted" v-if="notPaymentGateway"> Aún no se ha configurado una pasarela de pago, contacte con el administrador del sistema </span>

            <div v-else>
              <ProcessPaymentPagueATiempo
                v-if="paymentGatewayAvailableId === paymentGatewayAvailableConstant.PAGUE_A_TIEMPO && currentPaymentMethodAvailable"
                :payment-method-available="currentPaymentMethodAvailable"
                :invoiceId="currentInvoiceId"
                :value="valueToPaid"
                :process-payment="processPayment.value"
                :return-url="returnUrlLc"
                :params="params"
                @form="setForm"
              ></ProcessPaymentPagueATiempo>

              <span class="text-muted" v-else> Se ha encontrado un error con la configuración de la pasarela de pagos, contacte con el administrador del sistema </span>
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #actions>
      <AppButton
        v-if="typePaymentSelected == 'webCheckoutPayment' && currentPaymentMethodAvailable?.urlWebCheckout"
        :href="currentPaymentMethodAvailable.urlWebCheckout"
        label="Pagar"
        :target="'_blank'"
      ></AppButton>

      <AppButton v-else :disabled="dataFormPaymentManager && !dataFormPaymentManager.form?.policy" label="Pagar" @click="toPay"></AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { required, requiredIf, minValue, maxValue } from '../../plugins/vuelidate.plugin';
import { computed, defineComponent, onMounted, reactive, Ref, ref, watch, type PropType } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppButton from '../Buttons/AppButton.vue';
import AppFormModal from '../Modal/AppFormModal.vue';
import AppFormField from '../Forms/AppFormField.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import ProcessPaymentPagueATiempo from './ProcessPaymentPagueATiempo.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppUploadFile from '../Forms/AppUploadFile.vue';

import { PaymentGatewayAvailableConstant } from '../../constant/paymentGatewayAvailable.constant';
import { PaymentMethodsAvailableDto } from '../../dto/paymentGateway/paymentMethodsAvailable.dto';

import { InstitutionsService } from '../../services/institutions.service';
import { GetPaymentMethodsAvailableForPaymentFormsService } from '../../services/paymentGateway/getPaymentMethodsAvailableForPaymentForms.service';
import { CreateOrUpdateStepTypeCobroAttachmentService } from '../../../modules/surveys/services/createOrUpdateStepTypeCobroAttachment.service';

const getPaymentMethodsAvailableService = new GetPaymentMethodsAvailableForPaymentFormsService();
const institutionsService = new InstitutionsService();
const createOrUpdateStepTypeCobroAttachmentService = new CreateOrUpdateStepTypeCobroAttachmentService();

export default defineComponent({
  name: 'AppRegisterPaymentInvoice',
  components: {
    ProcessPaymentPagueATiempo,
    AppAutocomplete,
    AppFormModal,
    AppFormField,
    AppLoading,
    AppButton,
    AppUploadFile,
  },

  props: {
    convocationEnrolStepId: {
      required: true,
      type: Number,
    },
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
      default: () => {
        return {};
      },
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
    isOfficial: {
      required: false,
      type: Number,
      default: 0,
    },
    invoiceId: {
      required: true,
      type: Number,
    },
    initialPaymentMethod: {
      required: false,
      type: String,
      default: null,
    },
    initialPaymentTypeId: {
      required: false,
      type: Number,
      default: null,
    },
    paymentMethodsAvailableOptions: {
      required: false,
      type: Array as PropType<PaymentMethodsAvailableDto[]>,
      default: () => [],
    },
    hidePaymentSelection: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  emits: ['paymentCompleted', 'close'],

  setup(props, { emit }) {
    const returnUrlLc = window.location.origin + props.returnUrl;

    const DEFAULT_METHOD_COUNTED = 'Contado';
    const DEFAULT_METHOD_CREDIT = 'Crédito';

    const { n } = useI18n();

    const currentPaymentMethodAvailable: Ref<PaymentMethodsAvailableDto | null> = ref(null);
    const paymentMethodsAvailable: Ref<PaymentMethodsAvailableDto[]> = ref([]);
    const typePaymentSelected: Ref<String | null> = ref(null);

    const loading = ref(false);

    const paymentMethods = [DEFAULT_METHOD_COUNTED];
    if (props.allowCreditMethod) paymentMethods.push(DEFAULT_METHOD_CREDIT);

    const form = reactive({
      paymentMethod: props.initialPaymentMethod ?? DEFAULT_METHOD_COUNTED,
      paymentType: null as number | null,
      initialFee: props.minInitialFee,
      term: 2,
      payDay: 5,
      isFile: null,
    });
    const v$ = useVuelidate(
      {
        form: {
          paymentMethod: { required },
          paymentType: { required },
          isFile: {},
          initialFee: {
            requiredIf: requiredIf(() => {
              return form.paymentMethod === DEFAULT_METHOD_CREDIT;
            }),
            minValue: minValue(props.minInitialFee),
          },
          term: {
            requiredIf: requiredIf(() => {
              return form.paymentMethod === DEFAULT_METHOD_CREDIT;
            }),
            maxValue: maxValue(props.maxTerm),
            minValue: minValue(2),
          },
          payDay: {
            requiredIf: requiredIf(() => {
              return form.paymentMethod === DEFAULT_METHOD_CREDIT;
            }),
          },
        },
      },
      { form }
    );

    const feeValue = computed(() => Math.ceil(balance.value / form.term));
    const balance = computed(() => props.total - form.initialFee);
    const showPaymentSelectionFields = computed(() => !props.hidePaymentSelection || !form.paymentMethod || !form.paymentType);
    const selectedPaymentTypeLabel = computed(() => currentPaymentMethodAvailable.value?.title || 'Sin seleccionar');

    const valueToPaid = computed(() => (form.paymentMethod === DEFAULT_METHOD_CREDIT ? form.initialFee : props.total));

    const terms = [];

    for (let i = 2; i <= props.maxTerm; i++) {
      terms.push(i);
    }

    const payDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

    const currentInvoiceId = ref();
    const params = ref<any>(props.extraParams);
    const notPaymentGateway = ref(false);
    const paymentGatewayAvailableId = ref();
    const paymentGatewayAvailableConstant = PaymentGatewayAvailableConstant;
    // const processPayment = ref(false);
    const processPayment: { value: boolean } = reactive({
      value: false,
    });
    const dataFormPaymentManager = reactive<any>({
      form: null,
      v$: null,
    });
    const selectedFile: Ref<any> = ref(null);
    const currentData: Ref<any | null> = ref(null);

    const syncPaymentGatewayFromMethods = (methods: PaymentMethodsAvailableDto[]) => {
      for (let i = 0; i < methods.length; i++) {
        const currentPaymentMethod: PaymentMethodsAvailableDto = methods[i];

        if (currentPaymentMethod.paymentType == 'Pasarela') {
          paymentGatewayAvailableId.value = currentPaymentMethod.paymentGatewayAvailableId;
          notPaymentGateway.value = false;

          break;
        }
      }
    };

    const applyAvailablePaymentMethods = (methods: PaymentMethodsAvailableDto[]) => {
      paymentMethodsAvailable.value = methods;
      syncPaymentGatewayFromMethods(methods);

      if (methods.length) {
        const initialPaymentType = methods.find((paymentMethod) => paymentMethod.id === props.initialPaymentTypeId) ?? methods[0];

        form.paymentType = initialPaymentType?.id ?? null;
        currentPaymentMethodAvailable.value = initialPaymentType;

        paymentMethodSelection();
      }
    };

    onMounted(async () => {
      loading.value = true;

      try {
        const institution = institutionsService.getSelectedInstitution();

        if (!institution || !institution.paymentGatewayAvailableId) {
          notPaymentGateway.value = true;
        } else {
          paymentGatewayAvailableId.value = institution.paymentGatewayAvailableId;
        }

        if (props.paymentMethodsAvailableOptions.length) {
          applyAvailablePaymentMethods(props.paymentMethodsAvailableOptions);
        } else {
          const methods = await getPaymentMethodsAvailableService.run(props.isOfficial);
          applyAvailablePaymentMethods(methods);
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.paymentType,
      async (value) => {
        if (value) {
          currentPaymentMethodAvailable.value = paymentMethodsAvailable.value.filter((paymentMethod) => {
            return paymentMethod.id == value;
          })[0];

          console.log('currentPaymentMethodAvailable.value', currentPaymentMethodAvailable.value);

          paymentMethodSelection();
        }
      }
    );
    watch(
      () => typePaymentSelected.value,
      (newValue) => {
        if (newValue === 'webCheckoutPayment') {
          setTimeout(() => {
            if (confirm('Después de realizar el pago, por favor, no olvides cargar el comprobante.')) {
              window.open(currentPaymentMethodAvailable.value?.urlWebCheckout, '_blank');
            }
          }, 1000);
        }
      }
    );

    const paymentMethodSelection = () => {
      if (!currentPaymentMethodAvailable.value) {
        typePaymentSelected.value = null;
        return;
      }

      if (!currentPaymentMethodAvailable.value?.urlProdPaymentGateway && !currentPaymentMethodAvailable.value?.urlTestPaymentGateway && !currentPaymentMethodAvailable.value?.urlWebCheckout) {
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

    const setForm = (data: { form: any; v$: any }) => {
      dataFormPaymentManager.form = data.form;
      dataFormPaymentManager.v$ = data.v$;
    };

    const toPay = async () => {
      const isValid = await v$.value.$validate();
      const isValidPaymentManager = await dataFormPaymentManager.v$.$validate();
      if (!isValid && !isValidPaymentManager) return;

      try {
        const response = await props.service.run({
          invoice: {
            isCredit: form.paymentMethod === DEFAULT_METHOD_CREDIT,
            isQuote: false,
            totalPaid: 0,
          },
          quotes: form.paymentMethod === DEFAULT_METHOD_CREDIT ? form.term : null,
          valueQuote: form.paymentMethod === DEFAULT_METHOD_CREDIT ? feeValue.value : null,
          payDay: form.paymentMethod === DEFAULT_METHOD_CREDIT ? form.payDay : null,
          extraParams: props.extraParams,
        });

        currentInvoiceId.value = response.data.invoiceId;
        params.value = { ...params.value, ...response.data };
        processPayment.value = true;

        if (!props.minInitialFee && form.paymentMethod === DEFAULT_METHOD_CREDIT) {
          emit('paymentCompleted');
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    };

    const clickInputFile = (data: any) => {
      currentData.value = data;

      let inputFile = document.getElementById('inputFile');
      if (inputFile != null) inputFile.click();
    };
    const selectFile = (event: any) => {
      const files = event.target.files;
      if (!files.length) return;

      selectedFile.value = files[0];
    };

    const toUploadEvidence = async (file: any) => {
      try {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
        let dataSend = {
          files: file,
          value: props.total,
          endDateTime: `${formattedDate} ${formattedTime}`,
          invoiceId: props.invoiceId,
          orderNumber: null,
          status: 'Recibida',
          paymentMethodId: form.paymentType,
          convocationEnrolStepId: props.convocationEnrolStepId,
        };

        await createOrUpdateStepTypeCobroAttachmentService.run(dataSend);
        selectedFile.value = null;

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      n,
      loading,
      paymentMethods,
      terms,
      payDays,
      v$,
      feeValue,
      DEFAULT_METHOD_COUNTED,
      DEFAULT_METHOD_CREDIT,
      balance,
      showPaymentSelectionFields,
      selectedPaymentTypeLabel,
      params,
      notPaymentGateway,
      valueToPaid,
      returnUrlLc,
      dataFormPaymentManager,

      currentPaymentMethodAvailable,
      paymentMethodsAvailable,
      typePaymentSelected,

      paymentGatewayAvailableConstant,
      paymentGatewayAvailableId,
      processPayment,
      currentInvoiceId,

      toPay,
      setForm,
      currentData,
      clickInputFile,
      toUploadEvidence,
      selectFile,
      emit,
    };
  },
});
</script>

<style scoped>
.app-register-payment-invoice__selectionSummary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #f8fafc;
}

.app-register-payment-invoice__selectionItem {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-register-payment-invoice__selectionItem span {
  color: #64748b;
  font-size: 0.85rem;
}

.app-register-payment-invoice__selectionItem strong {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .app-register-payment-invoice__selectionSummary {
    grid-template-columns: 1fr;
  }
}
</style>
