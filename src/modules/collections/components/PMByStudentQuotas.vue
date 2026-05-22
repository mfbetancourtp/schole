<template>
    <AppDatatable :service="getInvoiceQuotesByMatriculateIdService" :params="{ matriculateId }" :name="name">
        <AppDatatableColumn label="Recibo" v-slot="{ row }" field="id" :sortable="true">
            {{ row.codeInvoice ?? row.invoiceId }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Cuota" v-slot="{ row }" field="numberQuote" :sortable="true">
            {{ row.numberQuote }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Fecha Vencimiento" v-slot="{ row }" field="dueDate" :sortable="true">
            {{ row.dueDate }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Valor" v-slot="{ row }" field="quoteValue" :sortable="true">
            {{ n(row.quoteValue, 'currency') }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Saldo" v-slot="{ row }" field="pendingValue" :sortable="true">
            {{ n(row.pendingValue, 'currency') }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Estado" v-slot="{ row }" field="statusQuote" :sortable="true">
            {{ row.statusQuote }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }">
            <div class="d-flex gap-2 align-items-center">
                <input 
                    v-if="row.statusQuote == 'Vencido'" 
                    class="form-check-input" type="checkbox"
                    :value="row.id" v-model="quotesIds"
                >

                <AppButton
                    v-if="row.statusQuote == 'Vencido' || row.statusQuote == 'Pendiente'" outlined v-tooltip="'Pagar'" 
                    icon="shopping-cart" @click="openPayModal(row)"
                ></AppButton>
            </div>
        </AppDatatableColumn>
    </AppDatatable>

    <AppModal v-model="payModal" :size="'lg'">
        <AppRegisterPaymentInvoiceQuote
            v-if="payModal && currentQuota?.invoiceId"
            :invoice-id="currentQuota.invoiceId.toString()"
            :value="currentQuota.pendingValue"
            :is-official="1"
            @close="closePayModal"
        ></AppRegisterPaymentInvoiceQuote>
    </AppModal>

    <div class="d-flex justify-content-end">
        <AppButton 
            :disabled="!quotesIds.length"
            :label="'Agregar a cobro'"
            class="text-white"
            :to="{
                name: 'collections.sendMessageOrToLegalCollections',
                params: { matriculateId: matriculateId, goTo: 'legal-collections' },
                query: { quotesIds: `${quotesIds}` }
            }"
        ></AppButton>
    </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { useI18n } from 'vue-i18n';

import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppRegisterPaymentInvoiceQuote from '../../../shared/components/PaymentGateway/AppRegisterPaymentInvoiceQuote.vue';

import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetInvoiceQuotesByMatriculateIdService } from "../services/getInvoiceQuotesByMatriculateId.service";

const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
    name: "PMByStudentQuotas",
    components: {
        AppRegisterPaymentInvoiceQuote,
        AppDatatableColumn,
        AppDatatable,
        AppButton,
        AppModal,
    },

    props: {
        matriculateId: {
            type: Number,
            required: true,
        },
    },

    setup(props) {
        const { t, n } = useI18n();

        const getInvoiceQuotesByMatriculateIdService = new GetInvoiceQuotesByMatriculateIdService();
        const name = 'PMByStudentQuotas';

        const currentQuota: Ref<any> = ref(null);
        const quotesIds: Ref<any[]> = ref([]);

        const payModal = ref(false);

        const openPayModal = (quota: any) => {
            currentQuota.value = quota;
            payModal.value = true;
        };
        const closePayModal = async () => {
            payModal.value = false;
            updateDatatableService.run();
        };

        return {
            getInvoiceQuotesByMatriculateIdService,
            name,
            t,
            n,

            currentQuota,
            quotesIds,
            payModal,

            closePayModal,
            openPayModal,
        };
    },
});
</script>

<style scoped>
</style>