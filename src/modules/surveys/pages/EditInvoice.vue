<template>
    <AppLoading v-if="loading"></AppLoading>

    <AppBaseList v-else :title="title" :routes="routes" :subtitle="subtitle">
        <template v-slot:actions>
            <AppButtonBack 
                :to="{
                    name: 'surveys.inscritosByStep',
                    params: { 
                        convocationId: convocationId,
                        convocationStepId: convocationStepId,
                    }
                }"
            ></AppButtonBack>

            <AppButton style="color: white;" @click="updateInvoice"> Guardar </AppButton>
        </template>

        <template v-slot:content>
            <AppCard>
                <template #body>
                    <section class="row">
                        <div class="col">
                            <h6>Institución</h6>
                            <p>{{ invoiceDetail.enrol.institutionName }}</p>
                        </div>

                        <div class="col">
                            <h6>Grado</h6>
                            <p>{{ invoiceDetail.enrol.degreeName || 'Sin grado asignado' }}</p>
                        </div>

                        <div class="col">
                            <h6>Fecha</h6>
                            <p>{{ invoiceDetail.invoice.createDate }}</p>
                        </div>

                        <div class="col text-end">
                            <h6>NUMERO DE RECIBO</h6>
                            <p>{{ invoiceDetail.invoice.id }}</p>
                        </div>
                    </section>

                    <hr>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Productos</th>
                                <th class="col-3">Valor Unitario</th>
                                <th class="col-1">Cantidad</th>
                                <th class="col-2">Descuento</th>
                                <th class="col-2">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="detail, index in invoiceDetail.invoice.details" :key="index">
                                <td>{{ detail.productName }}</td>
                                <td>${{ n(detail.unitValue, 'currency') }}</td>
                                <td>{{ detail.quantity }}</td>
                                <td>${{ n(detail.discountUnitValue, 'currency') }}</td>
                                <td>${{ n(detail.totalValue, 'currency') }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <hr>

                    <section>
                        <p>Descuentos</p>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Evidencia</th>
                                    <th class="col-3">Aplicar a</th>
                                    <th class="col-2">Valor</th>
                                    <th class="col-1">Estado</th>
                                    <th class="col-2">Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="enrolDiscount, index in invoiceDetail.enrolDiscounts" :key="index">
                                    <td>{{ enrolDiscount.discount.title }}</td>
                                    <td>
                                        <AppAutocomplete
                                            :disabled="enrolDiscount.discount.applyInvoice ? true : false"
                                            :options="invoiceDetail.discountTypes"
                                            v-model="enrolDiscount.rowId"
                                            :reduce="(d: any) => d.rowId"
                                            :label="'label'"
                                            @option:selected="updateTotalDiscount"
                                        ></AppAutocomplete>
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center justify-content-center gap-1">
                                            <span 
                                                class="h5 m-0" 
                                                v-bind:class="{
                                                    'opacity-100': !enrolDiscount.discount.isPercent,
                                                    'opacity-0': enrolDiscount.discount.isPercent,
                                                }"
                                            >$</span>

                                            <div class="w-75">
                                                <input 
                                                    :disabled="!enrolDiscount.discount.allowEdit"
                                                    v-model="enrolDiscount.discount.value"
                                                    type="number" class="form-control" 
                                                    @change="updateTotalDiscount"
                                                >
                                            </div>

                                            <span 
                                                class="h5 m-0" 
                                                v-bind:class="{
                                                    'opacity-100': enrolDiscount.discount.isPercent,
                                                    'opacity-0': !enrolDiscount.discount.isPercent,
                                                }"
                                            >%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <AppBadge :variant="buildStatusVariant(enrolDiscount.isAccept)" :label="enrolDiscount.isAccept == null ? 'Pendiente' : enrolDiscount.isAccept == 0 ? 'Rechazado' : 'Aceptado'"></AppBadge>
                                    </td>
                                    <td>
                                        <AppButtonGroup>
                                            <AppButton
                                                @click="openViewEvidenceModal(enrolDiscount)"
                                                v-tooltip="'Ver evidencia'"
                                                variant="primary"
                                                icon="eye"
                                                outlined
                                            ></AppButton>

                                            <!-- <AppButtonChat
                                            ></AppButtonChat> -->
                                        </AppButtonGroup>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <hr>

                    <section class="row gap-4">
                        <div class="col">
                            <label for="observations">Observaciones</label>
                            <AppVoiceInput id="observations" :rows="4" v-model="invoiceDetail.invoice.observations" textareaClass="form-control"  />

                        </div>

                        <div class="col">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>TOTAL</th>
                                        <th class="col-3">${{ n(totalValueProducts, 'currency') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Descuento factura</td>
                                        <td>${{ n(invoiceDetail.invoice.totalDiscount, 'currency') }}</td>
                                    </tr>
                                    <tr>
                                        <td>Total descuentos</td>
                                        <td>${{ n(totalDiscounts, 'currency') }}</td>
                                    </tr>
                                    <tr>
                                        <td>Valor Total</td>
                                        <td>${{ n((totalValueProducts - invoiceDetail.invoice.totalDiscount), 'currency') }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </template>
            </AppCard>

            <AppModal v-model="viewEvidenceModal" :size="'xl'">
                <ViewEvidenceDiscount
                    v-if="viewEvidenceModal"
                    :data="currentEvidence"
                    @close="closeViewEvidenceModal"
                ></ViewEvidenceDiscount>
            </AppModal>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import {useMeta} from 'vue-meta';
import {useRoute} from "vue-router";
import {VariantsConstant} from '../../../shared/constant/variants.constant';
import {computed, defineComponent, onMounted, Ref, ref} from "vue";

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import ViewEvidenceDiscount from '../components/ViewEvidenceDiscount.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
// import AppButtonChat from '../../../shared/components/Buttons/AppButtonChat.vue'
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {UpdateInvoiceService} from '../services/updateInvoice.service';
import {GetInvoiceToEditService} from '../services/getInvoiceToEdit.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getInvoiceToEditService = new GetInvoiceToEditService();
const updateInvoiceService = new UpdateInvoiceService();

export default defineComponent({
    name: "EditInvoice",
    components: {
        ViewEvidenceDiscount,
        AppAutocomplete,
        AppButtonGroup,
        AppButtonBack,
        // AppButtonChat,
        AppBaseList,
        AppLoading,
        AppButton,
        AppModal,
        AppBadge,
        AppCard,
        AppVoiceInput,
    },

    setup() {
        const {t} = useI18n();
        const {n} = useI18n();
        const route = useRoute();
        const title = "Editar Recibo";
        
        const routes: any = [{ name: title }];
        useMeta({ title: title });

        const convocationEnrolStepId = ref();
        const convocationStepId = ref();
        const convocationId = ref();
        const invoiceId = ref();

        // const usedDiscountIds = ref({invoice: {}, products: {}});
        const usedDiscountIds: Ref<any> = ref({invoice: {}, products: {}});
        const viewEvidenceModal = ref(false);
        const discountTypeInvoice = ref();
        const currentEvidence = ref();
        const invoiceDetail = ref();
        const loading = ref(true);
        const totalValue = ref(0);
        const subtitle = ref();

        onMounted(async () => {
            try {
                if (route.query.convocationEnrolStepId) {
                    convocationEnrolStepId.value = parseInt(route.query.convocationEnrolStepId.toString(), 10);
                    convocationStepId.value = parseInt(route.params.convocationStepId.toString(), 10);
                    convocationId.value = parseInt(route.params.convocationId.toString(), 10);
                    invoiceId.value = parseInt(route.params.invoiceId.toString(), 10);
                }

                await getData();

                discountTypeInvoice.value = invoiceDetail.value.discountTypes.filter((discountType: any) => discountType.type == 'invoiceId')[0];

                invoiceDetail.value.enrolDiscounts.forEach((enrolDiscount: any) => {
                    if (enrolDiscount.discount.applyInvoice) {
                        enrolDiscount.rowId = discountTypeInvoice.value.rowId;
                    }
                });

                await updateTotalDiscount();
                await loadRoutes();
            } catch (e) {console.log(e)}

            loading.value = false;
        });

        const totalValueProducts = computed(() => {
            let valueTemp = 0;

            invoiceDetail.value.invoice.details.forEach((detail: any) => {
                valueTemp += (detail.unitValue * detail.quantity) - detail.discountUnitValue;
            });

            return valueTemp;
        });

        const totalDiscounts = computed(() => {
            let valueTemp = invoiceDetail.value.invoice.totalDiscount;

            invoiceDetail.value.invoice.details.forEach((detail: any) => {
                valueTemp += detail.discountUnitValue;
            });

            return valueTemp;
        });

        const getData = async () => {
            try {
                invoiceDetail.value = await getInvoiceToEditService.run(invoiceId.value, convocationEnrolStepId.value);
                subtitle.value = `Recibo de: ${invoiceDetail.value.enrol.student}`;

                invoiceDetail.value.invoice.details.forEach((detail: any) => {
                    totalValue.value += (detail.unitValue * detail.quantity);
                });
            } catch (e) {console.log(e)}
        };

        const addOrRemoveDiscount = (enrolDiscountObject: object, detailId: any = null) => {
            let discountValueInvoice = 0;
            let discountValueProduct = 0;
            let discountIdsProducts: any = usedDiscountIds.value.products;
            let discountIdsInvoice: any = usedDiscountIds.value.invoice;
            let keysInvoice = Object.keys(usedDiscountIds.value.invoice);
            let keysProducts = Object.keys(usedDiscountIds.value.products);
            let KeyEnrolDiscountObject = Object.keys(enrolDiscountObject)[0];
            let discountUsedOnInvoice = keysInvoice.includes(KeyEnrolDiscountObject) ? true : false;
            let discountUsedOnProducts = keysProducts.includes(KeyEnrolDiscountObject) ? true : false;

            // eliminar el descuento en la factura - else - a un producto
            if (discountUsedOnInvoice && (discountIdsInvoice[KeyEnrolDiscountObject].detailId != detailId)) {
                delete discountIdsInvoice[KeyEnrolDiscountObject];
            } else if (discountUsedOnProducts && (discountIdsProducts[KeyEnrolDiscountObject].detailId != detailId)) {
                delete discountIdsProducts[KeyEnrolDiscountObject];
            }

            // agregar el descuento en la factura - else - a un producto
            if (detailId == null) {
                discountIdsInvoice[KeyEnrolDiscountObject] = {
                    value: Object.values(enrolDiscountObject)[0],
                    detailId: detailId,
                };
            } else {
                discountIdsProducts[KeyEnrolDiscountObject] = {
                    value: Object.values(enrolDiscountObject)[0],
                    detailId: detailId,
                }
            }

            usedDiscountIds.value = {
                invoice: { ...discountIdsInvoice },
                products: { ...discountIdsProducts },
            };

            keysInvoice = Object.keys(discountIdsInvoice);
            keysProducts = Object.keys(discountIdsProducts);

            keysInvoice.forEach((key: any) => {
                discountValueInvoice += usedDiscountIds.value.invoice[key].value;
            });

            invoiceDetail.value.invoice.details.forEach((detail: any) => {
                discountValueProduct = 0;

                keysProducts.forEach((key: any) => {
                    if (detail.id == discountIdsProducts[key].detailId) {
                        discountValueProduct += discountIdsProducts[key].value;
                    }
                });

                detail.discountUnitValue = discountValueProduct;
                detail.totalValue = (detail.unitValue * detail.quantity) - discountValueProduct;
                // discountValueInvoice += discountValueProduct;
            });

            invoiceDetail.value.invoice.totalDiscount = discountValueInvoice;
        };

        const declineDiscount = async (KeyEnrolDiscount: string) => {
            let discountValueInvoice = 0;
            let discountValueProduct = 0;
            let discountIdsProducts: any = usedDiscountIds.value.products;
            let discountIdsInvoice: any = usedDiscountIds.value.invoice;
            let keysInvoice = Object.keys(usedDiscountIds.value.invoice);
            let keysProducts = Object.keys(usedDiscountIds.value.products);
            let discountUsedOnInvoice = keysInvoice.includes(KeyEnrolDiscount) ? true : false;
            let discountUsedOnProducts = keysProducts.includes(KeyEnrolDiscount) ? true : false;

            if (!discountUsedOnInvoice && !discountUsedOnProducts) {
                return;
            }

            if (discountUsedOnInvoice) {
                delete discountIdsInvoice[KeyEnrolDiscount];
            } else if (discountUsedOnProducts) {
                delete discountIdsProducts[KeyEnrolDiscount];
            }

            usedDiscountIds.value = {
                invoice: { ...discountIdsInvoice },
                products: { ...discountIdsProducts },
            };

            keysInvoice = Object.keys(discountIdsInvoice);
            keysProducts = Object.keys(discountIdsProducts);

            keysInvoice.forEach((key: any) => {
                discountValueInvoice += usedDiscountIds.value.invoice[key].value;
            });

            invoiceDetail.value.invoice.details.forEach((detail: any) => {
                discountValueProduct = 0;

                keysProducts.forEach((key: any) => {
                    if (detail.id == discountIdsProducts[key].detailId) {
                        discountValueProduct += discountIdsProducts[key].value;
                    }
                });

                detail.discountUnitValue = discountValueProduct;
                detail.totalValue = (detail.unitValue * detail.quantity) - discountValueProduct;
                discountValueInvoice += discountValueProduct;
            });

            invoiceDetail.value.invoice.totalDiscount = discountValueInvoice;
        };

        const updateTotalDiscount = async () => {
            setTimeout(async () => {
                invoiceDetail.value.enrolDiscounts.forEach(async (enrolDiscount: any) => {
                    // console.log(enrolDiscount);

                    if (enrolDiscount.isAccept && enrolDiscount.rowId) {
                        let discountObject: any = {};
                        let discountValue = 0;
    
                        // descuento para la factura - else - descuento para un producto
                        if (enrolDiscount.discount.applyInvoice){
                            if (enrolDiscount.discount.isPercent) {
                                let percentageValue = totalValue.value * (enrolDiscount.discount.value / 100);
    
                                discountValue = percentageValue;
                            } else {
                                discountValue = enrolDiscount.discount.value;
                            }
    
                            enrolDiscount['discountValueTemp'] = discountValue;
                            discountObject['enrolDiscount_' + enrolDiscount.id] = discountValue;
                            addOrRemoveDiscount({...discountObject});
                        } else {
                            // setTimeout(async () => {
                                // descuento para la factura - else - descuento para un producto
                                if (discountTypeInvoice.value.rowId == enrolDiscount.rowId) {
                                    if (enrolDiscount.discount.isPercent) {
                                        let percentageValue = totalValue.value * (enrolDiscount.discount.value / 100);
    
                                        discountValue = percentageValue;
                                    } else {
                                        discountValue = enrolDiscount.discount.value;
                                    }
    
                                    enrolDiscount['discountValueTemp'] = discountValue;
                                    discountObject['enrolDiscount_' + enrolDiscount.id] = discountValue;
                                    addOrRemoveDiscount({...discountObject});
                                } else {
                                    invoiceDetail.value.invoice.details.forEach((detail: any) => {
                                        if (detail.id == enrolDiscount.rowId) {
                                            if (enrolDiscount.discount.isPercent) {
                                                let percentageValue = detail.unitValue * (enrolDiscount.discount.value / 100);
    
                                                discountValue = percentageValue;
                                            } else {
                                                discountValue = enrolDiscount.discount.value;
                                            }
    
                                            enrolDiscount['discountValueTemp'] = discountValue;
                                            discountObject['enrolDiscount_' + enrolDiscount.id] = discountValue;
                                            addOrRemoveDiscount({...discountObject}, detail.id);
                                        }
                                    });
                                }
                            // }, 500);
                        }
                    } else if (enrolDiscount.isAccept == 0 && enrolDiscount.rowId) {
                        await declineDiscount(`enrolDiscount_${enrolDiscount.id}`);
                    }
                });
            }, 500);
        };

        const openViewEvidenceModal = async (data: any) => {
            currentEvidence.value = data;

            viewEvidenceModal.value = true;
        };
        const closeViewEvidenceModal = async () => {
            try {
                let res = await getInvoiceToEditService.run(invoiceId.value, convocationEnrolStepId.value);

                invoiceDetail.value.enrolDiscounts.forEach((enrolDiscount: any) => {
                    let enrolDiscountUpdated = res.enrolDiscounts.filter((enrolDiscountRes: any) => enrolDiscountRes.id == enrolDiscount.id)[0];

                    enrolDiscount.isAccept = enrolDiscountUpdated.isAccept;
                });

                await updateTotalDiscount();
            } catch (e) {console.log(e)}

            viewEvidenceModal.value = false;
        };

        const updateInvoice = async () => {
            try {
                let enrolDiscounts: any = [];
                let details: any = [];

                invoiceDetail.value.invoice.details.forEach((detail: any) => {
                    details.push({
                        id: detail.id,
                        code: detail.code,
                        title: detail.productName,
                        productId: detail.productId,
                        productValueId: detail.productValueId,
                        quantity: detail.quantity,
                        unitValue: detail.unitValue,
                        discountUnitValue: detail.discountUnitValue,
                        totalValue: detail.totalValue,
                    });
                });

                invoiceDetail.value.enrolDiscounts.forEach((enrolDiscount: any) => {
                    let discountType = null;

                    if (enrolDiscount.rowId) {
                        discountType = invoiceDetail.value.discountTypes.filter((discountType: any) => discountType.rowId == enrolDiscount.rowId)[0].type;
                    }

                    enrolDiscounts.push({
                        id: enrolDiscount.id,
                        rowId: enrolDiscount.rowId,
                        discountValue: enrolDiscount.discountValueTemp || 0,
                        discountType: discountType,
                    });
                });

                const data = {
                    invoice: {
                        id: invoiceDetail.value.invoice.id,
                        totalDiscount: invoiceDetail.value.invoice.totalDiscount,
                        observations: invoiceDetail.value.invoice.observations,
                        details: details,
                    },
                    enrolDiscounts: enrolDiscounts,
                }

                console.log(data);

                await updateInvoiceService.run(data);
            } catch (e) {console.log(e)}
        };

        const loadRoutes = async () => {
            let convocationStepTitle = route.query.convocationStepTitle ?? null;
            let convocationTitle = route.query.convocationTitle ?? null;
            let stepType = route.query.stepType ?? null;

            routes.unshift(
                {
                    name: `procesos de matriculación`,
                    url: { name: 'surveys.convocationsList' },
                },
                {
                    name: `Resumen Inscritos "${convocationTitle}"`,
                    url: { 
                        name: 'surveys.previewInscritos',
                        params: { convocationId: convocationId.value }
                    },
                },
                {
                    name: `Inscritos paso ${stepType} "${convocationStepTitle}"`,
                    url: { 
                        name: 'surveys.inscritosByStep',
                        params: { 
                            convocationId: convocationId.value,
                            convocationStepId: convocationStepId.value,
                        }
                    },
                },
            );
        };
        const buildStatusVariant = (isAccept: string): VariantsConstant => {
            const colors: { [key: string]: VariantsConstant } = {
                    'null': 'dark',
                    '0': 'danger',
                }
                return colors[isAccept] ?? 'success';
            }

        return {
            loading,
            routes,
            title,
            t,
            n,

            convocationStepId,
            viewEvidenceModal,
            currentEvidence,
            convocationId,
            invoiceDetail,
            totalValue,
            subtitle,
            
            closeViewEvidenceModal,
            openViewEvidenceModal,
            updateTotalDiscount,
            buildStatusVariant,
            totalValueProducts,
            totalDiscounts,
            updateInvoice,
        };
    },
});
</script>

<style scoped>

</style>