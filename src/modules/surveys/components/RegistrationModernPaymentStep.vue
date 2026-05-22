<template>
  <AppLoading v-if="loading" />

  <div v-else class="modern-payment-step">
    <RegistrationModernHelpAccordion :description="resolvedHelpDescription" :video-url="resolvedTutorialVideoUrl" :default-open="true" />

    <div class="modern-payment-step__layout">
      <div class="modern-payment-step__content">
        <AppCard>
          <template #body>
            <div class="modern-payment-step__sectionHeader">
              <div>
                <span class="modern-payment-step__sectionEyebrow">Conceptos de pago</span>
                <h3>Detalle de la liquidación</h3>
                <p>Revisa qué conceptos están incluidos en esta inscripción y ajusta los opcionales antes de generar el pago.</p>
              </div>

              <div class="modern-payment-step__sectionActions">
                <AppChipPrime :label="overallStatus.label" :icon="overallStatus.icon" :variant="overallStatus.variant" :removable="false" />

                <AppButton :disabled="invoiceGenerated" variant="secondary" outlined @click="includeAll">
                  <AppIcon icon="plus" class="me-2" />
                  Incluir todo
                </AppButton>
              </div>
            </div>

            <AppAccordion v-slot="{ accordionId }" styleType="rounded">
              <AppAccordionItem :accordion-id="accordionId" :init-open="false">
                <template #head>
                  <div class="modern-payment-step__accordionHead">
                    <div>
                      <strong>{{ invoiceDetails.length }} conceptos</strong>
                      <span>Subtotal actual {{ n(totalValue, 'currency') }}</span>
                    </div>

                    <AppChipPrime
                      :label="invoiceGenerated ? 'Factura generada' : 'Pendiente'"
                      :icon="invoiceGenerated ? 'check-circle' : 'clock'"
                      :variant="invoiceGenerated ? 'success' : 'warning'"
                      :removable="false"
                    />
                  </div>
                </template>

                <template #content>
                  <div class="modern-payment-step__conceptGrid">
                    <div v-for="detail in invoiceDetails" :key="detail.code" class="modern-payment-step__conceptCard">
                      <div class="modern-payment-step__conceptHeader">
                        <div>
                          <span class="modern-payment-step__code">Código {{ detail.code }}</span>
                          <h4>{{ detail.title || detail.productName }}</h4>
                        </div>

                        <div class="modern-payment-step__conceptHeaderActions">
                          <AppChipPrime v-if="detail.discountUnitValue" :label="`-${n(detail.discountUnitValue, 'currency')}`" icon="tag" variant="success" :removable="false" />

                          <AppButtonDelete v-if="detail.isOptional" @click="removeDetail(detail.code)" />
                        </div>
                      </div>

                      <div class="modern-payment-step__conceptStats">
                        <div>
                          <span>Cantidad</span>
                          <strong>{{ detail.quantity }}</strong>
                        </div>

                        <div>
                          <span>Valor unitario</span>
                          <strong>{{ n(detail.unitValue, 'currency') }}</strong>
                        </div>

                        <div>
                          <span>Descuento</span>
                          <strong>{{ n(detail.discountUnitValue, 'currency') }}</strong>
                        </div>

                        <div>
                          <span>Total</span>
                          <strong>{{ n(detail.totalValue, 'currency') }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </AppAccordionItem>
            </AppAccordion>
          </template>
        </AppCard>

        <AppCard v-if="dataForDiscountTable.length">
          <template #body>
            <div class="modern-payment-step__sectionHeader">
              <div>
                <span class="modern-payment-step__sectionEyebrow">Descuentos</span>
                <h3>Beneficios disponibles</h3>
                <p>Selecciona el descuento que corresponda, adjunta la evidencia si es necesaria y envíalo a validación.</p>
              </div>
            </div>

            <AppAccordion v-slot="{ accordionId }" styleType="rounded">
              <AppAccordionItem v-for="discount in dataForDiscountTable" :key="discount.id" :accordion-id="accordionId" :init-open="false">
                <template #head>
                  <div class="modern-payment-step__discountHead">
                    <div>
                      <strong>{{ discount.title }}</strong>
                      <span>{{ discount.description || discount.descriptionAttachment }}</span>
                    </div>

                    <div class="modern-payment-step__discountHeadMeta">
                      <AppChipPrime :label="discountValueLabel(discount)" icon="tag" variant="secondary" :removable="false" />
                      <AppChipPrime :label="discountStatusMeta(discount).label" :icon="discountStatusMeta(discount).icon" :variant="discountStatusMeta(discount).variant" :removable="false" />
                    </div>
                  </div>
                </template>

                <template #content>
                  <div class="modern-payment-step__discountBody">
                    <p class="modern-payment-step__discountText">
                      {{ discount.description || 'Este descuento puede aplicar a tu proceso de inscripción.' }}
                    </p>

                    <div class="modern-payment-step__stateBox modern-payment-step__stateBox--info">
                      <AppIcon icon="info-circle" />
                      <span>
                        {{
                          discount.requireAttachment
                            ? discount.descriptionAttachment || 'Debes adjuntar un soporte para validar este descuento.'
                            : 'Este descuento no requiere soporte adicional y puede aplicarse directamente.'
                        }}
                      </span>
                    </div>

                    <template v-if="discount.requireAttachment">
                      <AppAttachmentDropzone
                        v-model="discountDrafts[discount.id]"
                        :certificate-url="discount.enrolDiscount?.urlAttachment ?? ''"
                        :is-show-delete="canDeleteDiscountSupport(discount) || Boolean(discountDrafts[discount.id])"
                        :is-title="'Soporte del descuento'"
                        :is-helper="'PDF, JPG o PNG (máx. 5MB)'"
                        :is-accept="'.pdf,.jpg,.jpeg,.png'"
                        :is-max-size-m-b="5"
                        @delete="handleDiscountDelete(discount)"
                      />

                      <div class="modern-payment-step__discountActions">
                        <AppButton v-if="discountDrafts[discount.id]" @click="uploadSupport(discount)">
                          <AppIcon icon="upload" class="me-2" />
                          Subir evidencia
                        </AppButton>

                        <AppButton v-if="discount.enrolDiscount?.urlAttachment" :href="discount.enrolDiscount.urlAttachment" target="_blank" outlined>
                          <AppIcon icon="eye" class="me-2" />
                          Ver soporte
                        </AppButton>
                      </div>
                    </template>

                    <div v-else class="modern-payment-step__discountActions">
                      <AppButton :disabled="Boolean(discount.enrolDiscount)" outlined @click="applyWithoutDiscount(discount)">
                        <AppIcon icon="check-circle" class="me-2" />
                        Aplicar descuento
                      </AppButton>
                    </div>

                    <div v-if="discount.enrolDiscount?.isAccept === 0" class="modern-payment-step__stateBox modern-payment-step__stateBox--danger">
                      <AppIcon icon="times-circle" />
                      <span>La solicitud fue rechazada. Puedes volver a cargar un soporte corregido.</span>
                    </div>

                    <div v-else-if="discount.enrolDiscount?.isAccept == null && discount.enrolDiscount?.id" class="modern-payment-step__stateBox modern-payment-step__stateBox--warning">
                      <AppIcon icon="clock" />
                      <span>La solicitud fue enviada y está pendiente de validación administrativa.</span>
                    </div>

                    <div v-if="discount.enrolDiscount?.id" class="modern-payment-step__discountFooter">
                      <AppButtonChat :comments="commentsForDiscount(discount.id)" :row-table="'ConvocationEnrolDiscounts'" :row-id="discount.enrolDiscount.id" @new-comment="newComment" />
                    </div>
                  </div>
                </template>
              </AppAccordionItem>
            </AppAccordion>
          </template>
        </AppCard>

        <div class="modern-payment-step__choicesGrid">
          <AppCard>
            <template #body>
              <div class="modern-payment-step__sectionHeader">
                <div>
                  <span class="modern-payment-step__sectionEyebrow">Forma de pago</span>
                  <h3>Cómo deseas financiar</h3>
                </div>
              </div>

              <div class="modern-payment-step__optionGrid">
                <button
                  type="button"
                  :class="[
                    'modern-payment-step__optionCard',
                    {
                      'is-active': selectedFinancingMethod === DEFAULT_METHOD_COUNTED,
                    },
                  ]"
                  @click="selectedFinancingMethod = DEFAULT_METHOD_COUNTED"
                >
                  <div class="modern-payment-step__optionIcon">
                    <AppIcon icon="wallet" />
                  </div>

                  <div>
                    <strong>Contado</strong>
                    <span>Pagas el valor total en una sola transacción.</span>
                  </div>
                </button>

                <button
                  v-if="allowCreditMethod"
                  type="button"
                  :class="[
                    'modern-payment-step__optionCard',
                    {
                      'is-active': selectedFinancingMethod === DEFAULT_METHOD_CREDIT,
                    },
                  ]"
                  @click="selectedFinancingMethod = DEFAULT_METHOD_CREDIT"
                >
                  <div class="modern-payment-step__optionIcon">
                    <AppIcon icon="credit-card" />
                  </div>

                  <div>
                    <strong>Cuotas</strong>
                    <span>{{ creditMethodDescription }}</span>
                  </div>
                </button>
              </div>
            </template>
          </AppCard>

          <AppCard>
            <template #body>
              <div class="modern-payment-step__sectionHeader">
                <div>
                  <span class="modern-payment-step__sectionEyebrow">Medio de pago</span>
                  <h3>Selecciona tu canal preferido</h3>
                </div>
              </div>

              <div v-if="paymentMethodsAvailable.length" class="modern-payment-step__optionGrid">
                <button
                  v-for="method in paymentMethodsAvailable"
                  :key="method.id"
                  type="button"
                  :class="['modern-payment-step__optionCard', { 'is-active': selectedPaymentTypeId === method.id }]"
                  @click="selectedPaymentTypeId = method.id"
                >
                  <div class="modern-payment-step__optionIcon">
                    <AppIcon :icon="paymentMethodIcon(method)" />
                  </div>

                  <div>
                    <strong>{{ method.title }}</strong>
                    <span>{{ paymentMethodDescription(method) }}</span>
                  </div>
                </button>
              </div>

              <div v-else class="modern-payment-step__stateBox modern-payment-step__stateBox--info">
                <AppIcon icon="info-circle" />
                <span>No se encontraron medios de pago configurados para esta institución.</span>
              </div>
            </template>
          </AppCard>
        </div>

        <AppCard>
          <template #body>
            <div class="modern-payment-step__sectionHeader">
              <div>
                <span class="modern-payment-step__sectionEyebrow">Pago</span>
                <h3>Completa tu pago</h3>
                <p>Usaremos la forma de financiación y el canal seleccionados arriba para continuar sin volver a pedirlos en otra ventana.</p>
              </div>
            </div>

            <div v-if="selectedFinancingMethod === DEFAULT_METHOD_CREDIT" class="modern-payment-step__paymentPlanGrid">
              <label class="modern-payment-step__field">
                <span>Cuotas</span>
                <select v-model.number="paymentPlan.term" class="form-select">
                  <option v-for="term in availableTerms" :key="term" :value="term">
                    {{ term }}
                  </option>
                </select>
              </label>

              <label class="modern-payment-step__field">
                <span>Día de pago</span>
                <select v-model.number="paymentPlan.payDay" class="form-select">
                  <option v-for="day in payDays" :key="day" :value="day">
                    {{ day }}
                  </option>
                </select>
              </label>

              <div v-if="paymentPlan.initialFee > 0" class="modern-payment-step__field modern-payment-step__field--summary">
                <span>Cuota inicial aplicada</span>
                <strong>{{ n(paymentPlan.initialFee, 'currency') }}</strong>
                <small>Este valor se usa automáticamente según la configuración del proceso.</small>
              </div>

              <div class="modern-payment-step__field modern-payment-step__field--summary">
                <span>Saldo a financiar</span>
                <strong>{{ n(paymentBalance, 'currency') }}</strong>
                <small>Valor estimado por cuota: {{ n(paymentFeeValue, 'currency') }}</small>
              </div>
            </div>

            <div v-if="creditConfigError" class="modern-payment-step__stateBox modern-payment-step__stateBox--danger">
              <AppIcon icon="times-circle" />
              <span>{{ creditConfigError }}</span>
            </div>

            <template v-if="requiresPaymentEvidence">
              <div class="modern-payment-step__stateBox modern-payment-step__stateBox--info">
                <AppIcon icon="info-circle" />
                <span>
                  {{
                    selectedPaymentFlow === 'webCheckoutPayment' && !webCheckoutStarted
                      ? 'Cuando abras la pasarela y completes el pago, podrás volver aquí para cargar el comprobante.'
                      : selectedPaymentFlow === 'webCheckoutPayment'
                      ? 'Adjunta aquí el comprobante del pago realizado en la pasarela externa.'
                      : 'Adjunta el comprobante y registra el pago en un solo paso.'
                  }}
                </span>
              </div>

              <template v-if="showPaymentEvidenceUploader">
                <AppAttachmentDropzone
                  v-model="paymentEvidenceDraft"
                  :is-show-delete="Boolean(paymentEvidenceDraft)"
                  :is-title="'Comprobante de pago'"
                  :is-helper="'PDF, JPG o PNG (máx. 5MB)'"
                  :is-accept="'.pdf,.jpg,.jpeg,.png'"
                  :is-max-size-m-b="5"
                />

                <div v-if="selectedPaymentFlow === 'webCheckoutPayment'" class="modern-payment-step__discountActions">
                  <AppButton :disabled="!canUploadPaymentEvidence" @click="uploadPaymentEvidence">
                    <AppIcon icon="upload" class="me-2" />
                    {{ loadingPaymentEvidence ? 'Guardando comprobante...' : 'Guardar comprobante' }}
                  </AppButton>
                </div>
              </template>
            </template>

            <template v-if="selectedPaymentFlow === 'paymentByGateway' && selectedPaymentMethod">
              <div class="modern-payment-step__stateBox modern-payment-step__stateBox--info">
                <AppIcon icon="shield-alt" />
                <span>El pago se procesará por pasarela. Acepta los términos para continuar con la redirección segura.</span>
              </div>

              <ProcessPaymentPagueATiempo
                :invoice-id="String(currentInvoiceId ?? invoiceIdProps ?? '')"
                :value="paymentValueToPay"
                :process-payment="processPayment.value"
                :return-url="returnUrl"
                :params="paymentGatewayParams"
                @form="setPaymentManagerForm"
              />
            </template>

            <div v-if="paymentActionSuccess" class="modern-payment-step__stateBox modern-payment-step__stateBox--success">
              <AppIcon icon="check-circle" />
              <span>{{ paymentActionSuccess }}</span>
            </div>

            <div v-if="paymentActionError" class="modern-payment-step__stateBox modern-payment-step__stateBox--danger">
              <AppIcon icon="times-circle" />
              <span>{{ paymentActionError }}</span>
            </div>
          </template>
        </AppCard>
      </div>

      <aside class="modern-payment-step__sidebar">
        <AppCard class="modern-payment-step__summaryCard">
          <template #body>
            <div class="modern-payment-step__sectionHeader">
              <div>
                <h3>Resumen final</h3>
              </div>
            </div>

            <div class="modern-payment-step__summaryRows">
              <div class="modern-payment-step__summaryRow">
                <span>Forma de pago</span>
                <strong>{{ selectedFinancingMethodLabel }}</strong>
              </div>

              <div class="modern-payment-step__summaryRow">
                <span>Método de pago</span>
                <strong>{{ selectedPaymentMethodLabel }}</strong>
              </div>

              <div class="modern-payment-step__summaryRow">
                <span>Subtotal</span>
                <strong>{{ n(totalValue, 'currency') }}</strong>
              </div>

              <div class="modern-payment-step__summaryRow">
                <span>Descuentos</span>
                <strong>-{{ n(totalDiscounts, 'currency') }}</strong>
              </div>

              <div class="modern-payment-step__summaryRow modern-payment-step__summaryRow--total">
                <span>{{ isTotalPaid ? 'Total pagado' : 'Total a pagar' }}</span>
                <strong>{{ n(summaryTotal, 'currency') }}</strong>
              </div>
            </div>

            <div class="modern-payment-step__stateBox modern-payment-step__stateBox--info">
              <AppIcon icon="info-circle" />
              <span>
                {{
                  selectedFinancingMethod === DEFAULT_METHOD_CREDIT
                    ? `Termina de ajustar aquí mismo las cuotas y el día de pago antes de continuar.`
                    : `El pago se realizará en una sola transacción cuando confirmes el proceso.`
                }}
              </span>
            </div>

            <div v-if="step?.statePayment" class="modern-payment-step__stateBox modern-payment-step__stateBox--success">
              <AppIcon icon="check-circle" />
              <span>Estado actual de la transacción: {{ step.statePayment }}</span>
            </div>
          </template>
        </AppCard>
      </aside>
    </div>

    <section v-if="isPayActionDisabled && payActionBlockedMessage" class="modern-payment-step__actionHint">
      <div class="modern-payment-step__stateBox modern-payment-step__stateBox--warning">
        <AppIcon icon="info-circle" />
        <span>{{ payActionBlockedMessage }}</span>
      </div>
    </section>

    <section class="modern-payment-step__actionBar">
      <div class="modern-payment-step__actionGroup">
        <AppButton :disabled="!step?.convocationEnrolStepId || invoiceGenerated || isPaymentButtonDisabled" variant="secondary" outlined @click="requestDiscount">
          <AppIcon icon="tag" class="me-2" />
          Solicitar descuentos
        </AppButton>

        <AppButton v-if="isAdmin" :disabled="isPaymentButtonDisabled" variant="secondary" outlined @click="generateInvoice">
          <AppIcon icon="file-alt" class="me-2" />
          Generar factura
        </AppButton>
      </div>

      <AppButton :disabled="isPayActionDisabled" @click="handlePay">
        <AppIcon icon="credit-card" class="me-2" />
        {{ payActionLabel }}
      </AppButton>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppAttachmentDropzone from '../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonChat from '../../../shared/components/Buttons/AppButtonChat.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppChipPrime from '../../../shared/components/AppChipPrime.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import ProcessPaymentPagueATiempo from '../../../shared/components/PaymentGateway/ProcessPaymentPagueATiempo.vue';
import type { PaymentMethodsAvailableDto } from '../../../shared/dto/paymentGateway/paymentMethodsAvailable.dto';
import { GetPaymentMethodsAvailableForPaymentFormsService } from '../../../shared/services/paymentGateway/getPaymentMethodsAvailableForPaymentForms.service';
import RegistrationModernHelpAccordion from './RegistrationModernHelpAccordion.vue';
import { ConvocationDiscountDto, StepTypeCobroDto } from '../dtos/stepTypeCobro.dto';
import { CreateOrUpdateStepTypeCobroAttachmentService } from '../services/createOrUpdateStepTypeCobroAttachment.service';
import { DeleteDiscountSupportService } from '../services/deleteDiscountSupport.service';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { PaymentInvoiceConvocationService } from '../services/paymentInvoiceConvocation.service';
import { PostPaymentsConvocationsInvoicesService } from '../services/postPaymentsConvocationsInvoices.service';
import { RequestDiscountService } from '../services/requestDiscount.service';
import { UploadDiscountSupportService } from '../services/uploadDiscountSupport.service';

const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const getConvocationWithStepsService = new GetConvocationWithStepsService();
const uploadDiscountSupportService = new UploadDiscountSupportService();
const deleteDiscountSupportService = new DeleteDiscountSupportService();
const requestDiscountService = new RequestDiscountService();
const postPaymentsConvocationsInvoicesService = new PostPaymentsConvocationsInvoicesService();
const getPaymentMethodsAvailableService = new GetPaymentMethodsAvailableForPaymentFormsService();
const createOrUpdateStepTypeCobroAttachmentService = new CreateOrUpdateStepTypeCobroAttachmentService();

const DEFAULT_METHOD_COUNTED = 'Contado';
const DEFAULT_METHOD_CREDIT = 'Crédito';

export default defineComponent({
  name: 'RegistrationModernPaymentStep',
  components: {
    AppAccordion,
    AppAccordionItem,
    AppAttachmentDropzone,
    AppButton,
    AppButtonChat,
    AppButtonDelete,
    AppCard,
    AppChipPrime,
    AppIcon,
    AppLoading,
    ProcessPaymentPagueATiempo,
    RegistrationModernHelpAccordion,
  },
  props: {
    embedded: {
      type: Boolean,
      default: true,
    },
    videoUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const { n } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const isAdmin = computed(() => (localStorage.getItem('administratorAsStudent') ? 1 : 0));

    const step: Ref<StepTypeCobroDto | null> = ref(null);
    const details: Ref<any> = ref(null);
    const dataForDiscountTable: Ref<ConvocationDiscountDto[]> = ref([]);
    const paymentMethodsAvailable: Ref<PaymentMethodsAvailableDto[]> = ref([]);

    const loading = ref(true);
    const loadingPaymentAction = ref(false);
    const loadingPaymentEvidence = ref(false);
    const totalValue = ref(0);
    const convocationEnrolId = ref(0);
    const convocationId = ref(0);
    const institutionId = ref(0);
    const stepId = ref(0);
    const returnUrl = ref('');
    const invoiceIdProps = ref<number | null>(null);
    const currentInvoiceId = ref<number | null>(null);
    const allowCreditMethod = ref(false);
    const minInitialFee = ref(0);
    const maxTerm = ref(12);
    const selectedFinancingMethod = ref(DEFAULT_METHOD_COUNTED);
    const selectedPaymentTypeId = ref<number | null>(null);
    const tutorialDescription = ref('');
    const tutorialVideoUrl = ref('');
    const resolvedTutorialVideoUrl = computed(() => props.videoUrl || tutorialVideoUrl.value);

    const comments: { value: Record<string, any> } = reactive({
      value: {},
    });
    const discountDrafts = reactive<Record<number, File | null>>({});
    const paymentPlan = reactive({
      initialFee: 0,
      term: 2,
      payDay: 5,
    });
    const paymentEvidenceDraft = ref<File | null>(null);
    const paymentActionError = ref('');
    const paymentActionSuccess = ref('');
    const paymentGatewayParams = ref<Record<string, any>>({});
    const webCheckoutStarted = ref(false);
    const processPayment: { value: boolean } = reactive({
      value: false,
    });
    const dataFormPaymentManager = reactive<any>({
      form: null,
      v$: null,
    });

    const paymentRegisterService = new PaymentInvoiceConvocationService();

    const parseRouteId = (param: unknown) => Number.parseInt(String(param ?? 0), 10) || 0;

    const invoiceDetails = computed(() => details.value?.invoice?.details ?? []);
    const invoiceGenerated = computed(() => typeof step.value?.detail?.invoice?.id === 'number');
    const productDiscounts = computed(() => invoiceDetails.value.reduce((acc: number, detail: any) => acc + Number(detail.discountUnitValue ?? 0), 0));
    const totalDiscounts = computed(() => Number(details.value?.invoice?.totalDiscount ?? 0) + productDiscounts.value);
    const paymentTotal = computed(() => Number(details.value?.invoice?.totalPurchase ?? 0));
    const selectedPaymentMethod = computed(() => paymentMethodsAvailable.value.find((method) => method.id === selectedPaymentTypeId.value) ?? null);
    const selectedPaymentFlow = computed(() => {
      if (!selectedPaymentMethod.value) return null;

      if (!selectedPaymentMethod.value.urlProdPaymentGateway && !selectedPaymentMethod.value.urlTestPaymentGateway && !selectedPaymentMethod.value.urlWebCheckout) {
        return 'paymentInCash';
      }

      if (selectedPaymentMethod.value.urlWebCheckout) return 'webCheckoutPayment';

      return 'paymentByGateway';
    });
    const isPaymentButtonDisabled = computed(() => {
      if (step.value) {
        const requiresApproval = step.value.requiresApproval;
        const isApproved = step.value.isApproved;

        return (
          (requiresApproval === 1 && isApproved === 1) ||
          (requiresApproval === 1 && isApproved === null) ||
          (requiresApproval === 0 && isApproved === 1) ||
          (requiresApproval === 0 && step.value.statePayment === 'Aprobada')
        );
      }

      return false;
    });
    const isTotalPaid = computed(() => {
      if (step.value) {
        const requiresApproval = step.value.requiresApproval;
        const isApproved = step.value.isApproved;

        return (requiresApproval === 0 && isApproved === 2) || (requiresApproval === 1 && isApproved === 1);
      }

      return false;
    });
    const summaryTotal = computed(() => {
      if (isTotalPaid.value) return Number(details.value?.invoice?.totalPaid ?? 0);

      return paymentTotal.value;
    });
    const availableTerms = computed(() => {
      const maxValue = Math.max(Number(maxTerm.value ?? 2), 2);

      return Array.from({ length: maxValue - 1 }, (_, index) => index + 2);
    });
    const creditMethodDescription = computed(() => {
      const maxQuotesLabel = `Disponible hasta ${maxTerm.value} cuotas`;

      if (minInitialFee.value > 0) {
        return `${maxQuotesLabel} con cuota inicial automática de ${n(minInitialFee.value, 'currency')}.`;
      }

      return `${maxQuotesLabel} sin cuota inicial.`;
    });
    const payDays = Array.from({ length: 30 }, (_, index) => index + 1);
    const paymentBalance = computed(() => Math.max(paymentTotal.value - Number(paymentPlan.initialFee || 0), 0));
    const paymentFeeValue = computed(() => {
      if (selectedFinancingMethod.value !== DEFAULT_METHOD_CREDIT) return paymentTotal.value;

      return paymentBalance.value > 0 ? Math.ceil(paymentBalance.value / Math.max(paymentPlan.term, 1)) : 0;
    });
    const paymentValueToPay = computed(() => (selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT ? Number(paymentPlan.initialFee || 0) : paymentTotal.value));
    const creditConfigError = computed(() => {
      if (selectedFinancingMethod.value !== DEFAULT_METHOD_CREDIT) return '';
      if (paymentPlan.initialFee < minInitialFee.value) return `La cuota inicial debe ser igual o superior a ${n(minInitialFee.value, 'currency')}.`;
      if (paymentPlan.initialFee > paymentTotal.value) return 'La cuota inicial no puede superar el total a pagar.';
      if (paymentPlan.term < 2 || paymentPlan.term > maxTerm.value) return `Selecciona entre 2 y ${maxTerm.value} cuotas.`;
      if (paymentPlan.payDay < 1 || paymentPlan.payDay > 30) return 'Selecciona un día de pago válido.';

      return '';
    });
    const requiresPaymentEvidence = computed(() => selectedPaymentFlow.value === 'paymentInCash' || selectedPaymentFlow.value === 'webCheckoutPayment');
    const showPaymentEvidenceUploader = computed(() => selectedPaymentFlow.value === 'paymentInCash' || (selectedPaymentFlow.value === 'webCheckoutPayment' && webCheckoutStarted.value));
    const canUploadPaymentEvidence = computed(() => Boolean(paymentEvidenceDraft.value && selectedPaymentTypeId.value && !loadingPaymentEvidence.value));
    const hasDiscountPendingApproval = computed(() => dataForDiscountTable.value.some((discount) => Boolean(discount.enrolDiscount?.id && discount.enrolDiscount.isAccept == null)));
    const isPayActionDisabled = computed(() => {
      if (isPaymentButtonDisabled.value || loadingPaymentAction.value) return true;
      if (!selectedPaymentTypeId.value || !selectedPaymentMethod.value) return true;
      if (selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT && !!creditConfigError.value) return true;
      if (selectedPaymentFlow.value === 'paymentInCash' && !paymentEvidenceDraft.value) return true;

      return Boolean(selectedPaymentFlow.value === 'paymentByGateway' && dataFormPaymentManager.form && !dataFormPaymentManager.form.policy);
    });
    const payActionBlockedMessage = computed(() => {
      if (loadingPaymentAction.value) return 'Estamos procesando tu información. Espera un momento para continuar.';

      if (step.value) {
        const requiresApproval = step.value.requiresApproval;
        const isApproved = step.value.isApproved;

        if (requiresApproval === 1 && isApproved === null) {
          if (hasDiscountPendingApproval.value) {
            return 'Tu soporte de descuento sigue en revisión. Cuando termine esa validación se habilitará el registro del pago.';
          }

          return 'Este paso está pendiente de aprobación. Debes esperar a que finalice la revisión para poder registrar el pago.';
        }

        if ((requiresApproval === 1 && isApproved === 1) || (requiresApproval === 0 && isApproved === 1) || step.value.statePayment === 'Aprobada') {
          return 'Este paso ya fue aprobado. No necesitas volver a registrar el pago.';
        }
      }

      if (!selectedPaymentTypeId.value || !selectedPaymentMethod.value) {
        return 'Selecciona tu canal preferido para habilitar el registro del pago.';
      }

      if (selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT && creditConfigError.value) {
        return creditConfigError.value;
      }

      if (selectedPaymentFlow.value === 'paymentInCash' && !paymentEvidenceDraft.value) {
        return 'Adjunta el comprobante de pago para habilitar el botón Registrar pago y comprobante.';
      }

      if (selectedPaymentFlow.value === 'paymentByGateway' && dataFormPaymentManager.form && !dataFormPaymentManager.form.policy) {
        return 'Debes aceptar los términos de la pasarela para continuar.';
      }

      return '';
    });
    const payActionLabel = computed(() => {
      if (isTotalPaid.value) return 'Pago registrado';
      if (selectedPaymentFlow.value === 'webCheckoutPayment') return 'Ir a pagar';
      if (selectedPaymentFlow.value === 'paymentByGateway') return 'Continuar al pago';
      if (selectedPaymentFlow.value === 'paymentInCash') return 'Registrar pago y comprobante';

      return 'Registrar pago';
    });

    const overallStatus = computed(() => {
      if (isTotalPaid.value) return { label: 'Pagado', icon: 'check-circle', variant: 'success' };
      if (step.value?.statePayment === 'Aprobada') return { label: 'Aprobada', icon: 'check-circle', variant: 'success' };
      if (step.value?.statePayment === 'Pendiente') return { label: 'Pendiente', icon: 'clock', variant: 'warning' };
      if (step.value?.convocationEnrolStepId) return { label: 'En proceso', icon: 'clock', variant: 'warning' };

      return {
        label: 'Sin iniciar',
        icon: 'info-circle',
        variant: 'secondary',
      };
    });
    const defaultHelpDescription =
      'En este paso debes revisar los conceptos de pago y aplicar los descuentos disponibles si cuentas con ellos.<br /><br />' +
      '• Revisa cada concepto de pago<br />' +
      "• Aplica descuentos haciendo clic en 'Aplicar descuento'<br />" +
      '• Si el descuento requiere validación, sube el documento correspondiente<br />' +
      '• Selecciona tu forma de pago preferida<br />' +
      '• Verifica el resumen final antes de proceder al pago';
    const resolvedHelpDescription = computed(() => String(tutorialDescription.value || defaultHelpDescription).replace(/\n/g, '<br />'));

    const syncComments = (discounts: ConvocationDiscountDto[]) => {
      const commentsMap: Record<string, any> = {};

      discounts.forEach((convocationDiscount) => {
        commentsMap[`convocationDiscount_${convocationDiscount.id}`] = convocationDiscount.enrolDiscount;
      });

      comments.value = commentsMap;
    };

    const loadStep = async () => {
      const response = await getConvocationWithStepsService.run(convocationId.value, {
        convocationEnrolId: convocationEnrolId.value,
        isAdmin: isAdmin.value,
      });

      const stepAux = response.steps.find((item: any) => item.id == stepId.value);
      const currentStep = await getConvocationStepWithDetailService.run({
        id: stepId.value,
        convocationEnrolId: convocationEnrolId.value,
      });

      if (currentStep && !('statePayment' in currentStep)) currentStep.statePayment = stepAux?.statePayment;

      step.value = currentStep;
      details.value = currentStep?.detail;
      totalValue.value = currentStep?.detail?.invoice?.totalValue ?? 0;
      dataForDiscountTable.value = currentStep?.detail?.convocationDiscounts ?? [];
      allowCreditMethod.value = Boolean(currentStep?.allowQuotes);
      minInitialFee.value = currentStep?.minInitialQuoteValue ?? 0;
      maxTerm.value = currentStep?.maxQuotes ?? 12;
      paymentPlan.initialFee = currentStep?.minInitialQuoteValue ?? 0;
      paymentPlan.term = Math.min(Math.max(2, paymentPlan.term), Math.max(Number(currentStep?.maxQuotes ?? 12), 2));
      tutorialDescription.value = stepAux?.description ?? '';
      tutorialVideoUrl.value = stepAux?.urlVideoConvocationStep ?? '';

      syncComments(dataForDiscountTable.value);

      if (!allowCreditMethod.value) {
        selectedFinancingMethod.value = DEFAULT_METHOD_COUNTED;
      }
    };

    const buildInvoiceDetailsPayload = () =>
      invoiceDetails.value.map((detail: any) => ({
        id: detail.id ?? null,
        code: detail.code,
        title: detail.productName,
        productId: detail.productId,
        productValueId: detail.productValueId,
        isOptional: detail.isOptional,
        quantity: detail.quantity,
        unitValue: detail.unitValue,
        discountUnitValue: detail.discountUnitValue,
        totalValue: detail.totalValue,
      }));

    const buildInvoicePayload = () => ({
      id: step.value?.detail.invoice.id ?? null,
      convocationEnrolId: convocationEnrolId.value,
      convocationStepId: stepId.value,
      convocationEnrolStepId: step.value?.convocationEnrolStepId,
      totalDiscount: step.value?.detail.invoice.totalDiscount,
      quotes: 0,
      valueQuote: 0,
      payDay: null,
      totalPaid: 0,
      isCredit: 0,
      details: buildInvoiceDetailsPayload(),
    });

    const loadPaymentMethods = async () => {
      paymentMethodsAvailable.value = await getPaymentMethodsAvailableService.run(stepId.value);

      if (!selectedPaymentTypeId.value) {
        selectedPaymentTypeId.value = paymentMethodsAvailable.value[0]?.id ?? null;
      }
    };

    const ensureInvoice = async () => {
      await generateInvoice();

      return invoiceIdProps.value ?? step.value?.detail.invoice.id ?? null;
    };

    const ensureConvocationEnrolStepId = async () => {
      if (step.value?.convocationEnrolStepId) return step.value.convocationEnrolStepId;

      await loadStep();

      return step.value?.convocationEnrolStepId ?? null;
    };

    const resetPaymentFeedback = () => {
      paymentActionError.value = '';
      paymentActionSuccess.value = '';
    };

    const buildPaymentRegisterPayload = () => ({
      invoice: {
        isCredit: selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT,
        isQuote: false,
        totalPaid: 0,
      },
      quotes: selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT ? paymentPlan.term : null,
      valueQuote: selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT ? paymentFeeValue.value : null,
      payDay: selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT ? paymentPlan.payDay : null,
      extraParams: {
        dataSend: buildInvoicePayload(),
      },
    });

    const newComment = async () => {
      await loadStep();
    };

    const generateInvoice = async () => {
      try {
        const response = await postPaymentsConvocationsInvoicesService.run(buildInvoicePayload());

        invoiceIdProps.value = response?.data?.invoiceId ?? null;
      } catch (error) {
        console.log(error);
      }
    };

    const includeAll = () => {
      totalValue.value = step.value?.detail?.invoice?.totalValue ?? 0;
      details.value.invoice.details = step.value?.detail.invoice.details;
    };

    const removeDetail = (code: string) => {
      const filteredDetails: any[] = [];
      totalValue.value = 0;

      details.value.invoice.details.forEach((detail: any) => {
        if (detail.code !== code) {
          totalValue.value += detail.totalValue;
          filteredDetails.push(detail);
        }
      });

      details.value.invoice.details = filteredDetails;
    };

    const paymentCompleted = async () => {
      await loadStep();
      emit('refresh');

      try {
        await router.replace(returnUrl.value);
      } catch (error) {
        console.log(error);
      }
    };

    const setPaymentManagerForm = (data: { form: any; v$: any }) => {
      dataFormPaymentManager.form = data.form;
      dataFormPaymentManager.v$ = data.v$;
    };

    const submitPaymentEvidence = async (invoiceIdOverride?: number | null) => {
      if (!paymentEvidenceDraft.value || !selectedPaymentTypeId.value) return;

      const invoiceId = invoiceIdOverride ?? currentInvoiceId.value ?? (await ensureInvoice());
      const convocationEnrolStepId = await ensureConvocationEnrolStepId();

      if (!convocationEnrolStepId) {
        throw new Error('Missing convocationEnrolStepId for payment evidence upload');
      }

      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

      await createOrUpdateStepTypeCobroAttachmentService.run({
        files: paymentEvidenceDraft.value,
        value: paymentTotal.value,
        endDateTime: `${formattedDate} ${formattedTime}`,
        invoiceId,
        orderNumber: null,
        status: 'Recibida',
        paymentMethodId: selectedPaymentTypeId.value,
        convocationEnrolStepId,
      });

      paymentEvidenceDraft.value = null;
    };

    const uploadPaymentEvidence = async () => {
      if (!canUploadPaymentEvidence.value) return;

      resetPaymentFeedback();
      loadingPaymentEvidence.value = true;

      try {
        await submitPaymentEvidence();
        await loadStep();
        emit('refresh');
        paymentActionSuccess.value = 'Comprobante cargado correctamente.';
      } catch (error) {
        console.log(error);
        paymentActionError.value = 'No fue posible cargar el comprobante. Intenta nuevamente.';
      } finally {
        loadingPaymentEvidence.value = false;
      }
    };

    const handlePay = async () => {
      if (!selectedPaymentMethod.value) {
        paymentActionError.value = 'Selecciona un canal de pago para continuar.';
        return;
      }

      if (creditConfigError.value) {
        paymentActionError.value = creditConfigError.value;
        return;
      }

      if (selectedPaymentFlow.value === 'paymentByGateway' && dataFormPaymentManager.v$) {
        const isValidPaymentManager = await dataFormPaymentManager.v$.$validate();

        if (!isValidPaymentManager) {
          paymentActionError.value = 'Debes aceptar los términos de la pasarela para continuar.';
          return;
        }
      }

      resetPaymentFeedback();
      loadingPaymentAction.value = true;

      try {
        if (selectedPaymentFlow.value === 'webCheckoutPayment' && selectedPaymentMethod.value.urlWebCheckout) {
          const checkoutWindow = window.open('', '_blank');
          const ensuredInvoiceId = await ensureInvoice();
          currentInvoiceId.value = ensuredInvoiceId;
          await ensureConvocationEnrolStepId();
          webCheckoutStarted.value = true;

          if (checkoutWindow) {
            checkoutWindow.opener = null;
            checkoutWindow.location.href = selectedPaymentMethod.value.urlWebCheckout;
          } else {
            window.open(selectedPaymentMethod.value.urlWebCheckout, '_blank', 'noopener,noreferrer');
          }

          paymentActionSuccess.value = 'Abrimos el canal de pago en una nueva pestaña. Luego podrás subir aquí mismo el comprobante.';
          return;
        }

        const response = await paymentRegisterService.run(buildPaymentRegisterPayload());
        currentInvoiceId.value = response?.data?.invoiceId ?? null;
        paymentGatewayParams.value = {
          dataSend: buildInvoicePayload(),
          ...(response?.data ?? {}),
        };

        if (selectedPaymentFlow.value === 'paymentInCash') {
          await submitPaymentEvidence(currentInvoiceId.value);
          paymentActionSuccess.value = 'Pago y comprobante registrados correctamente.';
          await loadStep();
          emit('refresh');
          return;
        }

        processPayment.value = true;

        if (!minInitialFee.value && selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT) {
          await paymentCompleted();
        }
      } catch (error) {
        console.log(error);
        paymentActionError.value = 'No fue posible continuar con el pago. Verifica la información e intenta nuevamente.';
      } finally {
        loadingPaymentAction.value = false;
      }
    };

    watch(
      () => selectedPaymentFlow.value,
      (flow) => {
        if (flow !== 'webCheckoutPayment') {
          webCheckoutStarted.value = false;
        }
      }
    );

    const requestDiscount = async () => {
      try {
        await requestDiscountService.run({
          id: details.value.invoice?.id ?? null,
          convocationEnrolId: convocationEnrolId.value,
          convocationStepId: stepId.value,
          convocationEnrolStepId: step.value?.convocationEnrolStepId,
          details: details.value.invoice.details,
        });

        await loadStep();
        emit('refresh');
      } catch (error) {
        console.log(error);
      }
    };

    const applyWithoutDiscount = async (discount: ConvocationDiscountDto) => {
      const dataSend: any = {
        convocationEnrolId: convocationEnrolId.value,
        convocationDiscountId: discount.id,
        convocationStepId: stepId.value,
      };

      if (discount.enrolDiscount?.id) dataSend.id = discount.enrolDiscount.id;
      if (step.value?.convocationEnrolStepId) dataSend.convocationEnrolStepId = step.value.convocationEnrolStepId;

      try {
        await uploadDiscountSupportService.run(dataSend);
        await loadStep();
        emit('refresh');
      } catch (error) {
        console.log(error);
      }
    };

    const uploadSupport = async (discount: ConvocationDiscountDto) => {
      if (!discountDrafts[discount.id]) return;

      const dataSend: any = {
        convocationEnrolId: convocationEnrolId.value,
        convocationDiscountId: discount.id,
        convocationStepId: stepId.value,
        file: discountDrafts[discount.id],
      };

      if (discount.enrolDiscount?.id) dataSend.id = discount.enrolDiscount.id;
      if (step.value?.convocationEnrolStepId) dataSend.convocationEnrolStepId = step.value.convocationEnrolStepId;

      try {
        await uploadDiscountSupportService.run(dataSend);
        discountDrafts[discount.id] = null;
        await loadStep();
        emit('refresh');
      } catch (error) {
        console.log(error);
      }
    };

    const canDeleteDiscountSupport = (discount: ConvocationDiscountDto) =>
      Boolean(discount.enrolDiscount?.id && discount.enrolDiscount?.urlAttachment && !discount.enrolDiscount?.isAccept && !isPaymentButtonDisabled.value);

    const handleDiscountDelete = async (discount: ConvocationDiscountDto) => {
      if (discountDrafts[discount.id]) {
        discountDrafts[discount.id] = null;
        return;
      }

      if (!discount.enrolDiscount?.id || !canDeleteDiscountSupport(discount)) return;

      try {
        await deleteDiscountSupportService.run(discount.enrolDiscount.id);
        await loadStep();
        emit('refresh');
      } catch (error) {
        console.log(error);
      }
    };

    const commentsForDiscount = (discountId: number) => comments.value[`convocationDiscount_${discountId}`]?.comments ?? [];

    const discountValueLabel = (discount: ConvocationDiscountDto) => {
      if (discount.isPercent) return `${discount.value}%`;

      return n(discount.value, 'currency');
    };

    const discountStatusMeta = (discount: ConvocationDiscountDto) => {
      if (!discount.enrolDiscount) return { label: 'Disponible', icon: 'tag', variant: 'secondary' };
      if (discount.enrolDiscount.isAccept === 1) return { label: 'Aprobado', icon: 'check-circle', variant: 'success' };
      if (discount.enrolDiscount.isAccept === 0) return { label: 'Rechazado', icon: 'times-circle', variant: 'danger' };

      return { label: 'En revisión', icon: 'clock', variant: 'warning' };
    };

    const paymentMethodIcon = (method: PaymentMethodsAvailableDto) => {
      const label = `${method.title} ${method.paymentType}`.toLowerCase();

      if (label.includes('pse') || label.includes('banco')) return 'university';
      if (label.includes('transfer')) return 'exchange-alt';

      return 'credit-card';
    };

    const paymentMethodDescription = (method: PaymentMethodsAvailableDto) => {
      if (method.urlWebCheckout) return 'Pago en línea con redirección segura.';
      if (method.urlProdPaymentGateway || method.urlTestPaymentGateway) return 'Procesado por pasarela de pagos.';

      return 'Registro manual del soporte de pago.';
    };

    const selectedPaymentMethodLabel = computed(() => {
      if (!selectedPaymentMethod.value) return 'Sin seleccionar';

      return [selectedPaymentMethod.value.title, selectedPaymentMethod.value.paymentType].filter(Boolean).join(' ');
    });

    const selectedFinancingMethodLabel = computed(() => (selectedFinancingMethod.value === DEFAULT_METHOD_CREDIT ? 'Crédito / Cuotas' : 'Contado'));

    onMounted(async () => {
      try {
        convocationEnrolId.value = parseRouteId(route.params.convocationEnrollId ?? route.query.convocationEnrollId);
        convocationId.value = parseRouteId(route.params.convocationId ?? route.query.convocationId);
        institutionId.value = parseRouteId(route.params.institutionId ?? route.query.institutionId);
        stepId.value = parseRouteId(route.params.stepId ?? route.query.stepId);

        returnUrl.value = `/surveys/user-convocations/${institutionId.value}/convocation/${convocationId.value}/registration/${convocationEnrolId.value}/modern?registrationFlow=modern&stepId=${stepId.value}`;

        await Promise.all([loadStep(), loadPaymentMethods()]);
      } catch (error) {
        console.log(error);
      }

      loading.value = false;
    });

    return {
      allowCreditMethod,
      applyWithoutDiscount,
      availableTerms,
      canDeleteDiscountSupport,
      canUploadPaymentEvidence,
      commentsForDiscount,
      creditMethodDescription,
      creditConfigError,
      currentInvoiceId,
      dataForDiscountTable,
      DEFAULT_METHOD_COUNTED,
      DEFAULT_METHOD_CREDIT,
      details,
      discountDrafts,
      discountStatusMeta,
      discountValueLabel,
      generateInvoice,
      handleDiscountDelete,
      handlePay,
      includeAll,
      invoiceDetails,
      invoiceGenerated,
      invoiceIdProps,
      isAdmin,
      isPayActionDisabled,
      isPaymentButtonDisabled,
      isTotalPaid,
      loading,
      loadingPaymentEvidence,
      maxTerm,
      minInitialFee,
      n,
      newComment,
      overallStatus,
      payActionLabel,
      payActionBlockedMessage,
      payDays,
      paymentActionError,
      paymentActionSuccess,
      paymentBalance,
      paymentEvidenceDraft,
      paymentFeeValue,
      paymentGatewayParams,
      paymentMethodDescription,
      paymentMethodIcon,
      paymentMethodsAvailable,
      paymentPlan,
      paymentTotal,
      paymentValueToPay,
      processPayment,
      removeDetail,
      requestDiscount,
      requiresPaymentEvidence,
      resolvedHelpDescription,
      resolvedTutorialVideoUrl,
      returnUrl,
      selectedFinancingMethod,
      selectedFinancingMethodLabel,
      selectedPaymentFlow,
      selectedPaymentMethod,
      selectedPaymentMethodLabel,
      selectedPaymentTypeId,
      setPaymentManagerForm,
      showPaymentEvidenceUploader,
      step,
      summaryTotal,
      totalDiscounts,
      totalValue,
      tutorialDescription,
      tutorialVideoUrl,
      uploadPaymentEvidence,
      uploadSupport,
      webCheckoutStarted,
    };
  },
});
</script>

<style scoped>
.modern-payment-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modern-payment-step__actionBar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem 1.45rem;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.05);
}

.modern-payment-step__sectionEyebrow,
.modern-payment-step__code {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  font-size: 0.69rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.modern-payment-step__sectionEyebrow {
  padding: 0.24rem 0.62rem;
}

.modern-payment-step__sectionEyebrow {
  background: #eff6ff;
  color: #1d4ed8;
}

.modern-payment-step__code {
  margin-bottom: 0.45rem;
  padding: 0.25rem 0.55rem;
  background: #f8fafc;
  color: #475569;
}

.modern-payment-step__sectionHeader p,
.modern-payment-step__discountText {
  margin: 0;
  color: #64748b;
}

.modern-payment-step__sectionActions,
.modern-payment-step__summaryPill,
.modern-payment-step__discountHeadMeta,
.modern-payment-step__conceptHeaderActions,
.modern-payment-step__discountFooter,
.modern-payment-step__discountActions,
.modern-payment-step__actionGroup {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modern-payment-step__summaryPill {
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1e3a8a;
}

.modern-payment-step__summaryPill strong,
.modern-payment-step__summaryPill span {
  display: block;
}

.modern-payment-step__summaryPill span {
  color: #64748b;
  font-size: 0.78rem;
}

.modern-payment-step__layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modern-payment-step__content,
.modern-payment-step__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modern-payment-step__sectionHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.modern-payment-step__sectionHeader h3,
.modern-payment-step__conceptHeader h4,
.modern-payment-step__discountHead strong {
  margin: 0.3rem 0 0;
  color: #0f172a;
  font-weight: 700;
  line-height: 1.25;
}

.modern-payment-step__sectionHeader h3 {
  font-size: 1.02rem;
}

.modern-payment-step__conceptHeader h4,
.modern-payment-step__discountHead strong {
  font-size: 0.97rem;
}

.modern-payment-step__conceptGrid,
.modern-payment-step__optionGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.modern-payment-step__conceptCard,
.modern-payment-step__optionCard {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
}

.modern-payment-step__conceptCard {
  padding: 1rem;
}

.modern-payment-step__conceptHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modern-payment-step__conceptStats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.modern-payment-step__conceptStats span,
.modern-payment-step__summaryRow span,
.modern-payment-step__optionCard span,
.modern-payment-step__discountHead span {
  display: block;
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.45;
}

.modern-payment-step__conceptStats strong,
.modern-payment-step__summaryRow strong,
.modern-payment-step__optionCard strong {
  display: block;
  margin-top: 0.2rem;
  color: #0f172a;
  font-size: 0.95rem;
}

.modern-payment-step__discountBody {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modern-payment-step__discountHead {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modern-payment-step__choicesGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.modern-payment-step__optionCard {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem;
  text-align: left;
  transition: all 0.2s ease;
}

.modern-payment-step__optionCard:hover,
.modern-payment-step__optionCard.is-active {
  border-color: #0f172a;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.modern-payment-step__optionCard.is-active {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.modern-payment-step__optionIcon {
  width: 2.75rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #eff6ff;
  color: #1d4ed8;
  flex-shrink: 0;
}

.modern-payment-step__summaryRows {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
}

.modern-payment-step__summaryRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.modern-payment-step__summaryRow--total {
  padding-top: 0.8rem;
  border-top: 1px solid #e2e8f0;
}

.modern-payment-step__summaryRow--total strong {
  font-size: 1.08rem;
}

.modern-payment-step__tips {
  margin: 0;
  padding-left: 1.1rem;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.modern-payment-step__paymentPlanGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.modern-payment-step__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.modern-payment-step__field span,
.modern-payment-step__field small {
  color: #64748b;
  font-size: 0.84rem;
}

.modern-payment-step__field strong {
  color: #0f172a;
  font-size: 1rem;
}

.modern-payment-step__field--summary {
  justify-content: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.modern-payment-step__stateBox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.95rem 1rem;
  border-radius: 18px;
  font-size: 0.86rem;
  line-height: 1.45;
}

.modern-payment-step__stateBox--info {
  background: #eff6ff;
  color: #1d4ed8;
}

.modern-payment-step__stateBox--warning {
  background: #fffbeb;
  color: #92400e;
}

.modern-payment-step__stateBox--danger {
  background: #fef2f2;
  color: #b91c1c;
}

.modern-payment-step__stateBox--success {
  background: #f0fdf4;
  color: #166534;
}

.modern-payment-step__actionHint {
  margin-bottom: 0.9rem;
}

.modern-payment-step__actionBar {
  align-items: center;
}

@media (max-width: 1024px) {
  .modern-payment-step__choicesGrid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .modern-payment-step__actionBar,
  .modern-payment-step__sectionHeader,
  .modern-payment-step__discountHead,
  .modern-payment-step__conceptHeader {
    flex-direction: column;
  }
}
</style>
