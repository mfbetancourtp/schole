<template>
  <AppLoading v-if="loading"></AppLoading>
  <div v-else>
    <template v-if="embedded">
      <AppCard>
        <template #body>
          <AppLoading v-if="loadingData"></AppLoading>

          <div v-else>
            <div class="d-flex flex-row-reverse">
              <AppButton :disabled="typeof step?.detail.invoice.id == 'number'" :label="'Incluir Todo'" @click="includeAll()" variant="primary"></AppButton>
            </div>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Concepto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Valor Unitario</th>
                    <th scope="col">Descuento</th>
                    <th scope="col">Valor Total</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(detail, index) in details.invoice.details" :key="index">
                    <td scope="row">{{ detail.code }}</td>
                    <td scope="row">
                      {{ detail.title || detail.productName }}
                    </td>
                    <td scope="row">{{ detail.quantity }}</td>
                    <td scope="row">${{ n(detail.unitValue, 'currency') }}</td>
                    <td scope="row">${{ n(detail.discountUnitValue, 'currency') }}</td>
                    <td scope="row">${{ n(detail.totalValue, 'currency') }}</td>
                    <td scope="row">
                      <AppButtonDelete v-if="detail.isOptional" @click="removeDetail(detail.code)"></AppButtonDelete>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="isTotalPaid" class="d-flex flex-column align-items-end">
              <h5>Subtotal: ${{ n(totalValue, 'currency') }}</h5>
              <h5>Descuentos: ${{ n(details.invoice.totalDiscount + productDiscounts, 'currency') }}</h5>
              <h3>Total pagado: ${{ n(details.invoice.totalPaid, 'currency') }}</h3>
            </div>
            <div v-else class="d-flex flex-column align-items-end">
              <h5>Subtotal: ${{ n(totalValue, 'currency') }}</h5>
              <h5>Descuentos: ${{ n(details.invoice.totalDiscount + productDiscounts, 'currency') }}</h5>
              <h3>Total a pagar: ${{ n(details.invoice.totalPurchase, 'currency') }}</h3>
            </div>
            <div class="table-responsive">
              <table class="table" v-if="dataForDiscountTable.length">
                <thead>
                  <tr>
                    <th>Descuento</th>
                    <th>Evidencia necesaria</th>
                    <th>Archivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="loadingDataForDiscountTable">
                    <td colspan="5">
                      <AppLoading v-if="loadingDataForDiscountTable"></AppLoading>
                    </td>
                  </tr>

                  <tr v-else v-for="(discount, index) in dataForDiscountTable" :key="index">
                    <td>{{ discount.description || discount.title }}</td>
                    <td>{{ discount.descriptionAttachment }}</td>
                    <td>
                      <div class="d-flex justify-content-center">
                        <AppButton
                          :disabled="discount.enrolDiscount"
                          v-if="!discount.requireAttachment"
                          @click="applyWithoutDiscount(discount)"
                          :label="'Aplicar'"
                          variant="primary"
                          class="flex-fill"
                          outlined
                        ></AppButton>

                        <div v-if="(!discount.enrolDiscount || !discount.enrolDiscount?.urlAttachment) && discount.requireAttachment">
                          <input type="file" id="fileIn" @change="uploadSupport($event, discount)" />
                        </div>

                        <a v-else-if="discount.requireAttachment" :href="discount.enrolDiscount?.urlAttachment" target="_blank" class="route-file">Ver archivo</a>
                      </div>
                    </td>
                    <td>
                      <span v-if="discount.enrolDiscount && discount.enrolDiscount.urlAttachment">
                        {{ discount.enrolDiscount.isAccept == null ? 'Pendiente' : discount.enrolDiscount.isAccept == 1 ? 'Aceptado' : 'Rechazado' }}
                      </span>
                    </td>
                    <td>
                      <AppButtonDelete
                        :disabled="discount.enrolDiscount?.isAccept || isPaymentButtonDisabled"
                        v-if="discount.enrolDiscount?.id && discount.enrolDiscount.urlAttachment"
                        @click="deleteDiscountSupport(discount.enrolDiscount.id)"
                        class="me-2"
                      ></AppButtonDelete>

                      <AppButtonChat
                        v-if="discount.enrolDiscount?.id"
                        :comments="comments.value[`convocationDiscount_${discount.id}`].comments ?? []"
                        :row-table="'ConvocationEnrolDiscounts'"
                        :row-id="discount.enrolDiscount.id"
                        @new-comment="newComment"
                      ></AppButtonChat>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-1">
            <AppButton
              :disabled="!step?.convocationEnrolStepId || typeof step.detail.invoice.id == 'number' || isPaymentButtonDisabled"
              :label="'Solicitar descuentos'"
              @click="requestDiscount"
              variant="primary"
              outlined
            ></AppButton>

            <AppButton v-if="isAdmin" :disabled="isPaymentButtonDisabled" @click="generateInvoice" :label="'Generar factura'"></AppButton>

            <AppButton @click="modalPayment" :disabled="isPaymentButtonDisabled" variant="primary" :label="'Pagar'"></AppButton>
          </div>
        </template>
      </AppCard>
    </template>

    <AppBaseList v-else :title="title" :routes="routes" :use-banner="true" :urlBanner="convocation?.urlBanner ?? convocation?.thumbnail ?? ImageNotAvailable">
      <template v-slot:actions>
        <AppButtonBack :to="backRoute"></AppButtonBack>
        <SaveAndExitStep style="color: white" :disabled="isPaymentButtonDisabled" :route-back="backRoute" :convocation-enrol-id="convocationEnrolId" :convocation-step-id="stepId"></SaveAndExitStep>
      </template>

      <template v-slot:content>
        <template v-if="convocation">
          <AppCard class="mb-3">
            <template #body>
              <section style="color: #f43f5e; font-size: 20px" v-html="convocation.title"></section>
              <section class="description-container">
                <h5>Descripción:</h5>

                <template v-if="step.description">
                  <div v-html="step.description"></div>
                </template>

                <span v-else>Sin descripción</span>
              </section>
            </template>
          </AppCard>
        </template>
        <AppCard>
          <template #body>
            <AppLoading v-if="loadingData"></AppLoading>

            <div v-else>
              <div class="d-flex flex-row-reverse">
                <AppButton :disabled="typeof step?.detail.invoice.id == 'number'" :label="'Incluir Todo'" @click="includeAll()" variant="primary"></AppButton>
              </div>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">Código</th>
                      <th scope="col">Concepto</th>
                      <th scope="col">Cantidad</th>
                      <th scope="col">Valor Unitario</th>
                      <th scope="col">Descuento</th>
                      <th scope="col">Valor Total</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(detail, index) in details.invoice.details" :key="index">
                      <td scope="row">{{ detail.code }}</td>
                      <td scope="row">
                        {{ detail.title || detail.productName }}
                      </td>
                      <td scope="row">{{ detail.quantity }}</td>
                      <td scope="row">${{ n(detail.unitValue, 'currency') }}</td>
                      <td scope="row">${{ n(detail.discountUnitValue, 'currency') }}</td>
                      <td scope="row">${{ n(detail.totalValue, 'currency') }}</td>
                      <td scope="row">
                        <AppButtonDelete v-if="detail.isOptional" @click="removeDetail(detail.code)"></AppButtonDelete>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="isTotalPaid" class="d-flex flex-column align-items-end">
                <h5>Subtotal: ${{ n(totalValue, 'currency') }}</h5>
                <h5>Descuentos: ${{ n(details.invoice.totalDiscount + productDiscounts, 'currency') }}</h5>
                <h3>Total pagado: ${{ n(details.invoice.totalPaid, 'currency') }}</h3>
              </div>
              <div v-else class="d-flex flex-column align-items-end">
                <h5>Subtotal: ${{ n(totalValue, 'currency') }}</h5>
                <h5>Descuentos: ${{ n(details.invoice.totalDiscount + productDiscounts, 'currency') }}</h5>
                <h3>Total a pagar: ${{ n(details.invoice.totalPurchase, 'currency') }}</h3>
              </div>
              <div class="table-responsive">
                <table class="table" v-if="dataForDiscountTable.length">
                  <thead>
                    <tr>
                      <th>Descuento</th>
                      <th>Evidencia necesaria</th>
                      <th>Archivo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-if="loadingDataForDiscountTable">
                      <td colspan="5">
                        <AppLoading v-if="loadingDataForDiscountTable"></AppLoading>
                      </td>
                    </tr>

                    <tr v-else v-for="(discount, index) in dataForDiscountTable" :key="index">
                      <td>{{ discount.description || discount.title }}</td>
                      <td>{{ discount.descriptionAttachment }}</td>
                      <td>
                        <div class="d-flex justify-content-center">
                          <AppButton
                            :disabled="discount.enrolDiscount"
                            v-if="!discount.requireAttachment"
                            @click="applyWithoutDiscount(discount)"
                            :label="'Aplicar'"
                            variant="primary"
                            class="flex-fill"
                            outlined
                          ></AppButton>

                          <div v-if="(!discount.enrolDiscount || !discount.enrolDiscount?.urlAttachment) && discount.requireAttachment">
                            <input type="file" id="fileIn" @change="uploadSupport($event, discount)" />
                          </div>

                          <a v-else-if="discount.requireAttachment" :href="discount.enrolDiscount?.urlAttachment" target="_blank" class="route-file">Ver archivo</a>
                        </div>
                      </td>
                      <td>
                        <span v-if="discount.enrolDiscount && discount.enrolDiscount.urlAttachment">
                          {{ discount.enrolDiscount.isAccept == null ? 'Pendiente' : discount.enrolDiscount.isAccept == 1 ? 'Aceptado' : 'Rechazado' }}
                        </span>
                      </td>
                      <td>
                        <!-- :disabled="(typeof step?.detail.invoice.id == 'number') || (discount.enrolDiscount?.isAccept)" -->
                        <AppButtonDelete
                          :disabled="discount.enrolDiscount?.isAccept || isPaymentButtonDisabled"
                          v-if="discount.enrolDiscount?.id && discount.enrolDiscount.urlAttachment"
                          @click="deleteDiscountSupport(discount.enrolDiscount.id)"
                          class="me-2"
                        ></AppButtonDelete>

                        <AppButtonChat
                          v-if="discount.enrolDiscount?.id"
                          :comments="comments.value[`convocationDiscount_${discount.id}`].comments ?? []"
                          :row-table="'ConvocationEnrolDiscounts'"
                          :row-id="discount.enrolDiscount.id"
                          @new-comment="newComment"
                        ></AppButtonChat>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-1">
              <AppButton
                :disabled="!step?.convocationEnrolStepId || typeof step.detail.invoice.id == 'number' || isPaymentButtonDisabled"
                :label="'Solicitar descuentos'"
                @click="requestDiscount"
                variant="primary"
                outlined
              ></AppButton>

              <AppButton v-if="isAdmin" :disabled="isPaymentButtonDisabled" @click="generateInvoice" :label="'Generar factura'"></AppButton>

              <AppButton @click="modalPayment" :disabled="isPaymentButtonDisabled" variant="primary" :label="'Pagar'"></AppButton>
            </div>
          </template>
        </AppCard>
      </template>
    </AppBaseList>

    <AppModal v-model="showModalPayment" :size="'lg'">
      <AppRegisterPaymentInvoice
        v-if="showModalPayment"
        :convocation-enrol-step-id="step?.convocationEnrolStepId"
        :return-url="returnUrl"
        :total="details.invoice.totalPurchase"
        :service="paymentRegisterService"
        :extra-params="extraParams"
        :allow-credit-method="allowCreditMethod"
        :max-term="maxTerm"
        :min-initial-fee="minInitialFee"
        @paymentCompleted="paymentCompleted"
        :invoice-id="invoiceIdProps"
        @close="modalPaymentClose"
      >
      </AppRegisterPaymentInvoice>
    </AppModal>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute, useRouter } from 'vue-router';
import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';

import SaveAndExitStep from '../components/SaveAndExitStep.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonChat from '../../../shared/components/Buttons/AppButtonChat.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppRegisterPaymentInvoice from '../../../shared/components/PaymentGateway/AppRegisterPaymentInvoice.vue';

import { ConvocationDto } from '../dtos/convocation.dto';
import { StepTypeCobroDto, ConvocationDiscountDto } from '../dtos/stepTypeCobro.dto';

import { RequestDiscountService } from '../services/requestDiscount.service';
import { GetConvocationByIdService } from '../services/getConvocationById.service';
import { UploadDiscountSupportService } from '../services/uploadDiscountSupport.service';
import { DeleteDiscountSupportService } from '../services/deleteDiscountSupport.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';
import { PaymentInvoiceConvocationService } from '../services/paymentInvoiceConvocation.service';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';
import { PostPaymentsConvocationsInvoicesService } from '../services/postPaymentsConvocationsInvoices.service';
import { buildRegistrationRoute, isModernRegistrationFlow } from '../utils/registrationFlow.utils';

const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const getConvocationWithStepsService = new GetConvocationWithStepsService();
const uploadDiscountSupportService = new UploadDiscountSupportService();
const deleteDiscountSupportService = new DeleteDiscountSupportService();
const getConvocationByIdService = new GetConvocationByIdService();
const getInstitutionByIdService = new GetInstitutionByIdService();
const requestDiscountService = new RequestDiscountService();

const postPaymentsConvocationsInvoicesService = new PostPaymentsConvocationsInvoicesService();

export default defineComponent({
  name: 'StepTypeCobro',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    AppRegisterPaymentInvoice,
    AppButtonDelete,
    SaveAndExitStep,
    AppButtonBack,
    AppButtonChat,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
  },

  setup(props) {
    const title = ref();
    const { t } = useI18n();
    const { n } = useI18n();
    useMeta({ title: 'Paso: Cobro' });
    const routes: any[] = [{ name: '' }];
    const isAdmin = computed(() => (localStorage.getItem('administratorAsStudent') ? 1 : 0));

    const convocation: Ref<ConvocationDto | null> = ref(null);

    const step: Ref<StepTypeCobroDto | null> = ref(null);

    const dataForDiscountTable: Ref<any> = ref([]);
    const loadingDataForDiscountTable = ref(false);
    const totalValue: Ref<any> = ref(0);
    const showModalPayment = ref(false);
    const convocationEnrolId = ref();
    const details: Ref<any> = ref();
    const loadingData = ref(false);
    const convocationId = ref();
    const institutionId = ref();
    const router = useRouter();
    const loading = ref(true);
    const extraParams = ref();
    const route = useRoute();
    const returnUrl = ref();
    const stepId = ref();
    const invoiceIdProps = ref();

    const allowCreditMethod = ref(false);
    const minInitialFee = ref(0);
    const maxTerm = ref(12);

    const comments: { value: any[] } = reactive({
      value: [],
    });
    const useModernRegistration = computed(() => isModernRegistrationFlow(route.query));
    const backRoute = computed(() =>
      buildRegistrationRoute(
        {
          institutionId: institutionId.value,
          convocationId: convocationId.value,
          convocationEnrollId: convocationEnrolId.value,
        },
        useModernRegistration.value
      )
    );

    const paymentRegisterService = new PaymentInvoiceConvocationService();

    onMounted(async () => {
      try {
        convocationEnrolId.value = parseInt(route.params.convocationEnrollId.toString(), 10);
        convocationId.value = parseInt(route.params.convocationId.toString(), 10);
        institutionId.value = parseInt(route.params.institutionId.toString(), 10);
        stepId.value = parseInt(String(route.params.stepId ?? route.query.stepId), 10);

        returnUrl.value = `/surveys/user-convocations/${institutionId.value}/convocation/${convocationId.value}/registration/${convocationEnrolId.value}${
          useModernRegistration.value ? '/modern' : ''
        }`;

        let params2 = {
          convocationEnrolId: convocationEnrolId.value,
          isAdmin: isAdmin.value,
        };

        const response = await getConvocationWithStepsService.run(convocationId.value, params2);
        const stepAux = response.steps.filter((item: any) => item.id == stepId.value)[0];

        let params = {
          id: stepId.value,
          convocationEnrolId: convocationEnrolId.value,
        };

        step.value = await getConvocationStepWithDetailService.run(params);
        totalValue.value = step.value?.detail?.invoice?.totalValue ?? 0;
        details.value = step.value?.detail;
        title.value = step.value?.title;

        if (step.value && !('statePayment' in step.value)) step.value.statePayment = stepAux.statePayment;

        console.log('stepAux', stepAux);
        console.log('step', step.value);

        if (step.value?.detail.convocationDiscounts) {
          let objAux: any = {};

          step.value?.detail.convocationDiscounts.forEach((convocationDiscount: ConvocationDiscountDto) => {
            objAux['convocationDiscount_' + convocationDiscount.id] = convocationDiscount.enrolDiscount;
          });

          comments.value = objAux;
        }

        dataForDiscountTable.value = details.value.convocationDiscounts;

        let res: StepTypeCobroDto = await getConvocationStepWithDetailService.run(params);
        allowCreditMethod.value = res.allowQuotes ? true : false;
        minInitialFee.value = res.minInitialQuoteValue;
        maxTerm.value = res.maxQuotes;

        if (!props.embedded) {
          await loadRoutes();
          await loadBanner();
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const productDiscounts = computed(() => {
      let valueTemp = 0;

      step.value?.detail.invoice.details.forEach((detail: any) => {
        valueTemp += detail.discountUnitValue;
      });

      return valueTemp;
    });

    const newComment = async () => {
      try {
        let params = {
          id: stepId.value,
          convocationEnrolId: convocationEnrolId.value,
        };

        let res: StepTypeCobroDto = await getConvocationStepWithDetailService.run(params);
        let objAux: any = {};

        res.detail.convocationDiscounts.forEach((convocationDiscount: ConvocationDiscountDto) => {
          objAux['convocationDiscount_' + convocationDiscount.id] = convocationDiscount.enrolDiscount;
        });

        comments.value = objAux;
      } catch (e) {
        console.log(e);
      }
    };

    // const getData = async () => {
    //     let params = {
    //         id: stepId.value,
    //         convocationEnrolId: convocationEnrolId.value,
    //     };

    //     step.value = await getConvocationStepWithDetailService.run(params);
    // };

    const generateInvoice = async () => {
      try {
        const detailsSend: any[] = [];

        details.value.invoice.details.forEach((detail: any) => {
          detailsSend.push({
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
          });
        });

        const dataSend = {
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
          details: detailsSend,
        };

        const response = await postPaymentsConvocationsInvoicesService.run(dataSend);
        invoiceIdProps.value = response?.data?.invoiceId;
      } catch (e) {
        console.log(e);
      }
    };

    const updateDataForDiscountTable = async () => {
      loadingDataForDiscountTable.value = true;

      try {
        let params = {
          id: stepId.value,
          convocationEnrolId: convocationEnrolId.value,
        };

        let res: StepTypeCobroDto = await getConvocationStepWithDetailService.run(params);

        if (res.detail.convocationDiscounts) {
          let objAux: any = {};

          res.detail.convocationDiscounts.forEach((convocationDiscount: ConvocationDiscountDto) => {
            objAux['convocationDiscount_' + convocationDiscount.id] = convocationDiscount.enrolDiscount;
          });

          comments.value = objAux;
        }

        if (step.value) {
          step.value.convocationEnrolStepId = res.convocationEnrolStepId;
        }
        dataForDiscountTable.value = res?.detail.convocationDiscounts;
      } catch (e) {
        console.log(e);
      }

      loadingDataForDiscountTable.value = false;
    };

    const modalPayment = async () => {
      const detailsSend: any[] = [];

      details.value.invoice.details.forEach((detail: any) => {
        detailsSend.push({
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
        });
      });

      const dataSend: any = {
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
        details: detailsSend,
      };

      (extraParams.value = {
        dataSend: dataSend,
      }),
        (showModalPayment.value = !showModalPayment.value);

      await generateInvoice();
    };
    const modalPaymentClose = async () => {
      showModalPayment.value = false;
    };

    const includeAll = () => {
      totalValue.value = step.value?.detail?.invoice?.totalValue ?? 0;
      details.value.invoice.details = step.value?.detail.invoice.details;
    };

    const removeDetail = (code: any) => {
      let arrAux: any[] = [];
      totalValue.value = 0;

      details.value.invoice.details.forEach((detail: any) => {
        if (detail.code != code) {
          totalValue.value += detail.totalValue;
          arrAux.push(detail);
        }
      });

      details.value.invoice.details = arrAux;
    };

    const paymentCompleted = async () => {
      await router.push(returnUrl.value);
    };

    const applyWithoutDiscount = async (discount: any) => {
      const dataSend: any = {
        convocationEnrolId: convocationEnrolId.value,
        convocationDiscountId: discount.id,
        convocationStepId: stepId.value,
      };

      if (discount.enrolDiscount?.id) {
        dataSend.id = discount.enrolDiscount?.id;
      }
      if (step.value?.convocationEnrolStepId) {
        dataSend.convocationEnrolStepId = step.value.convocationEnrolStepId;
      }

      try {
        await uploadDiscountSupportService.run(dataSend);

        await updateDataForDiscountTable();
      } catch (e) {
        console.log(e);
      }
    };

    const uploadSupport = async (element: any, discount: any) => {
      const files = element.target.files;
      if (!files.length) {
        return;
      }
      console.log('desc', discount);
      console.log('element');
      const dataSend: any = {
        convocationEnrolId: convocationEnrolId.value,
        convocationDiscountId: discount.id,
        convocationStepId: stepId.value,
        file: files[0],
      };
      console.log('data', dataSend);
      if (discount.enrolDiscount?.id) {
        dataSend.id = discount.enrolDiscount?.id;
      }
      if (step.value?.convocationEnrolStepId) {
        dataSend.convocationEnrolStepId = step.value.convocationEnrolStepId;
      }

      try {
        await uploadDiscountSupportService.run(dataSend);

        await updateDataForDiscountTable();
      } catch (e) {
        console.log(e);
      }
    };
    const getFile = () => {
      let fileUpload = document.getElementById('fileIn');
      if (fileUpload != null) {
        fileUpload.click();
      }
    };

    const requestDiscount = async () => {
      loadingData.value = true;

      try {
        const dataSend = {
          id: details.value.invoice?.id ?? null,
          convocationEnrolId: convocationEnrolId.value,
          convocationStepId: stepId.value,
          convocationEnrolStepId: step.value?.convocationEnrolStepId,
          details: details.value.invoice.details,
        };

        await requestDiscountService.run(dataSend);

        let params = {
          id: stepId.value,
          convocationEnrolId: convocationEnrolId.value,
        };

        step.value = await getConvocationStepWithDetailService.run(params);
        totalValue.value = step.value?.detail?.invoice?.totalValue ?? 0;
        details.value = step.value?.detail;
        title.value = step.value?.title;

        dataForDiscountTable.value = details.value.convocationDiscounts;
      } catch (e) {
        console.log(e);
      }

      loadingData.value = false;
    };

    const deleteDiscountSupport = async (id: number) => {
      try {
        await deleteDiscountSupportService.run(id);
        await updateDataForDiscountTable();
        // window.location.reload();
      } catch (e) {
        console.log(e);
      }
    };

    const loadRoutes = async () => {
      convocation.value = await getConvocationByIdService.run(convocationId.value);
      let response = await getInstitutionByIdService.run(institutionId.value);

      routes[0].name = title.value;

      routes.unshift(
        {
          name: `Procesos de matriculación colegio ${response.institution.name}`,
          url: {
            name: 'surveys.userConvocations',
          },
          params: { institutionId: institutionId.value },
        },
        {
          name: `Proceso de matriculación "${convocation.value?.title}"`,
          url: backRoute.value,
        }
      );
    };

    const loadBanner = () => {
      return `
                height: 15rem;
                background-image: url(${convocation.value?.urlBanner ?? convocation.value?.thumbnail ?? ImageNotAvailable});
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
                overflow: hidden;
            `;
    };
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

    return {
      isAdmin,
      stepId,
      routes,
      title,
      t,
      n,

      convocationEnrolId,
      ImageNotAvailable,
      showModalPayment,
      isTotalPaid,
      convocationId,
      institutionId,
      convocation,
      extraParams,
      loadingData,
      totalValue,
      returnUrl,
      comments,
      loading,
      details,
      step,
      allowCreditMethod,
      minInitialFee,
      maxTerm,

      loadingDataForDiscountTable,
      dataForDiscountTable,

      paymentRegisterService,
      paymentCompleted,
      backRoute,
      productDiscounts,
      removeDetail,
      modalPayment,
      includeAll,
      newComment,
      invoiceIdProps,
      loadBanner,

      deleteDiscountSupport,
      applyWithoutDiscount,
      requestDiscount,
      uploadSupport,
      getFile,
      isPaymentButtonDisabled,
      modalPaymentClose,

      generateInvoice,
    };
  },
});
</script>

<style scoped>
.filter {
  backdrop-filter: blur(3px);
  background: rgb(0, 0, 0);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%);
}

.mb-3 {
  max-height: 20rem;
  width: 100%;
}
.h5 {
  font-size: 1.25rem;
}
</style>
