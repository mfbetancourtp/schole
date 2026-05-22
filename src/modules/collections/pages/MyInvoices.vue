<template>
    <AppBaseList :title="title" :routes="routes">
        <template #content>
            <AppLoading v-if="loading"></AppLoading>

            <AppDatatable v-else :service="getInvoicesByUserIdWithPaginationService" :params="params" :name="name">
                <template #filters>
                    <AppFilter v-model="statusId" :filter-name="`${name}.statusId`">
                        <label for="statusId">Estado</label>
                        <AppAutocomplete :input-id="'statusId'" v-model="statusId" :options="status" :multiple="true"></AppAutocomplete>
                    </AppFilter>

                    <div class="form-row">
                        <AppFilter v-model="dateSince" :filter-name="`${name}.dateSince`" @isNotInitialized="defaultDateSince">
                            <label for="dateSince">Fecha inicial</label>
                            <input type="date" class="form-control" id="dateSince" v-model="dateSince">
                        </AppFilter>

                        <AppFilter v-model="dateUntil" :filter-name="`${name}.dateUntil`" @isNotInitialized="defaultDateUntil">
                            <label for="dateUntil">Fecha final</label>
                            <input type="date" class="form-control" id="dateUntil" v-model="dateUntil">
                        </AppFilter>
                    </div>
                </template>

                <AppDatatableColumn label="Recibo" v-slot="{ row }" field="id" :sortable="true">
                    {{ row.id }}
                </AppDatatableColumn>
                <AppDatatableColumn label="Fecha" v-slot="{ row }" field="createDate" :sortable="true">
                    {{ row.createDate }}
                </AppDatatableColumn>
                <AppDatatableColumn label="Institución" v-slot="{ row }" field="institutionName" :sortable="true">
                    {{ row.institutionName }}
                </AppDatatableColumn>
                <AppDatatableColumn label="Forma de pago" v-slot="{ row }" field="isCredit" :sortable="true">
                    {{ row.isCredit ? 'Crédito' : 'Contado' }}
                </AppDatatableColumn>
                <AppDatatableColumn label="Total" v-slot="{ row }" field="totalValue" :sortable="true">
                    {{ n(row.totalValue, 'currency') }}
                </AppDatatableColumn>
                <AppDatatableColumn label="Saldo" v-slot="{ row }">
                    {{ n(row.totalValue - row.totalPaid, 'currency') }}
                </AppDatatableColumn>
                <AppDatatableColumn label="Estado" v-slot="{ row }" field="status" :sortable="true">
                  <AppBadge :variant="buildStatusVariant(row.status)" :label="row.status"></AppBadge>
                </AppDatatableColumn>

                <AppDatatableColumn v-slot="{ row }">
                    <!-- <AppButton
                        v-if="row.PendingValue > 0" v-tooltip="'Pagar'" icon="dollar-sign" outlined @click="showPaymentModal(row)"
                    ></AppButton> -->
                    <AppButton
                        v-if="row.PendingValue > 0" v-tooltip="'Pagar'" icon="shopping-cart" outlined @click="openPayModal(row)"
                    ></AppButton>
                </AppDatatableColumn>
            </AppDatatable>

            <AppModal v-model="paymentModal">
                <AddPaymentFromAdmin
                    v-if="paymentModal" :sale="currentInvoice" @close="closePaymentModal"
                ></AddPaymentFromAdmin>
            </AppModal>

            <AppModal v-model="payModal" :size="'lg'">
                <AppRegisterPaymentInvoiceQuote
                    v-if="payModal" :invoice-id="currentInvoice.id.toString()" :value="currentInvoice.PendingValue"
                ></AppRegisterPaymentInvoiceQuote>
            </AppModal>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AddPaymentFromAdmin from '../../casurid/components/addPaymentFromAdmin.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppRegisterPaymentInvoiceQuote from '../../../shared/components/PaymentGateway/AppRegisterPaymentInvoiceQuote.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';

import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetStatusInstitutionsService } from '../../casurid/services/getStatusInstitutions.service';
import { GetStartAndEndDateMonthService } from '../../../shared/services/getStartAndEndDateMonth.service';
import { GetInvoicesByUserIdWithPaginationService } from '../services/getInvoicesByUserIdWithPagination.service';
import {VariantsConstant} from '../../../shared/constant/variants.constant';
import { useHeaderStore } from '../../../stores/header.store';

const getStartAndEndDateMonthService = new GetStartAndEndDateMonthService();
const getStatusInstitutionsService = new GetStatusInstitutionsService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
    name: 'MyInvoices',
    components: {
      AppBadge,
      AppRegisterPaymentInvoiceQuote,
        AddPaymentFromAdmin,
        AppDatatableColumn,
        AppAutocomplete,
        AppDatatable,
        AppBaseList,
        AppLoading,
        AppButton,
        AppFilter,
        AppModal,
    },

    setup() {
        const {n} = useI18n();

        const title = 'Mis facturas';
        const routes = [{ name: title }];
        useMeta({ title });

        const getInvoicesByUserIdWithPaginationService = new GetInvoicesByUserIdWithPaginationService();
        const name = 'myInvoices';

        const currentInvoice: Ref<any> = ref();
        const status: Ref<any[]> = ref([]);

        const dateSince = ref();
        const dateUntil = ref();
        const statusId = ref();

        const paymentModal = ref(false);
        const payModal = ref(false);
        const loading = ref(true);

        const params = computed(() => {
            return {
                status: statusId.value,
                dateSince: dateSince.value,
                dateUntil: dateUntil.value,
            };
        });

        onMounted(async () => {
            try {
                const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Cartera', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
                status.value = await getStatusInstitutionsService.run();
            } catch (e) {}
            loading.value = false;
        });

        const defaultDateSince = () => {
            const rangeDate = getStartAndEndDateMonthService.run();
            dateSince.value = rangeDate.startDate;
        };
        const defaultDateUntil = () => {
            const rangeDate = getStartAndEndDateMonthService.run();
            dateUntil.value = rangeDate.endDate;
        };

        const showPaymentModal = (invoice: any) => {
            paymentModal.value = true;
            currentInvoice.value = invoice;
        };
        const closePaymentModal = () => {
            paymentModal.value = false;
            updateDatatableService.run();
        };

        const openPayModal = (quota: any) => {
            currentInvoice.value = quota;
            payModal.value = true;
        };
        const closePayModal = async () => {
            payModal.value = false;
        };

        const buildStatusVariant = (status: string): VariantsConstant => {
          const colors: { [key: string]: VariantsConstant } = {
            'Pagada': 'success',
            'Anulado': 'danger',
            'Cotización': 'secondary'
          }

          return colors[status] ?? 'warning';
        }

        return {
            loading,
            routes,
            title,
            n,

            getInvoicesByUserIdWithPaginationService,
            currentInvoice,
            paymentModal,
            dateSince,
            dateUntil,
            statusId,
            payModal,
            params,
            status,
            name,

            closePaymentModal,
            defaultDateSince,
            defaultDateUntil,
            showPaymentModal,
            closePayModal,
            openPayModal,
          buildStatusVariant,
        };
    },
});
</script>

<style scoped>

</style>
