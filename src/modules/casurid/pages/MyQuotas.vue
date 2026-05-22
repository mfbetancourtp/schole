<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <AppDatatable :name="name" :service="getMyQuotasWithPaginationService" :params="params">
        <template v-slot:filters>
          <AppFilter v-model="invoiceId" :filter-name="`${name}.invoiceId`">
            <label for="invoiceId">Recibo</label>
            <v-select
                input-id="invoiceId"
                v-model="invoiceId"
                :filterable="false"
                @search="searchInvoices"
                :options="invoices.value"
                label="code"
                :reduce="(invoice) => invoice.id"
                multiple
            >
            </v-select>
          </AppFilter>

          <AppFilter v-model="statusId" :filter-name="`${name}.status`">
            <label for="status">Estado</label>
            <v-select
                input-id="status"
                v-model="statusId"
                class="tw-flex-1"
                :options="status.value"
                label="name"
                :reduce="(status) => status.id"
                multiple
            >
            </v-select>
          </AppFilter>
        </template>

        <AppDatatableColumn label="Recibo" field="invoiceId" :sortable="true" v-slot="{ row }">
          {{ row.invoiceId }}
        </AppDatatableColumn>

        <AppDatatableColumn label="# Cuota" v-slot="{ row }">
          {{ row.numberQuote }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Fecha vencimiento" field="dueDate" :sortable="true" v-slot="{ row }">
          {{ row.dueDate }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Valor" field="quoteValue" :sortable="true" v-slot="{ row }">
          {{ row.quoteValue }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Saldo" field="PendingValue" :sortable="true" v-slot="{ row }">
          {{ row.PendingValue }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="statusQuote" :sortable="true" v-slot="{ row }">
          {{ row.statusQuote }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }">
          <AppButton
              v-if="row.statusQuote !== 'Pagado'"
              variant="primary"
              outlined
              v-tooltip="'Pagar'"
              @click="openPayModal(row)"
              icon="shopping-cart">
          </AppButton>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="payModal" :size="'lg'">
        <AppRegisterPaymentInvoiceQuote
            v-if="payModal && currentQuota?.invoiceId"
            :invoice-id="currentQuota.invoiceId.toString()"
            :value="currentQuota.PendingValue"
        ></AppRegisterPaymentInvoiceQuote>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import {useMeta} from 'vue-meta';
import {debounce} from 'ts-debounce';
import {computed, defineComponent, onMounted, reactive, ref} from 'vue';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppRegisterPaymentInvoiceQuote
  from '../../../shared/components/PaymentGateway/AppRegisterPaymentInvoiceQuote.vue';

import {GetInvoicesForSelectService} from '../services/getInvoicesForSelect.service';
import {GetMyQuotasWithPaginationService} from '../services/getMyQuotasWithPagination.service';

import {QuotaDto} from '../dtos/quota.dto';
import {InvoiceDto} from '../dtos/invoice.dto';

const getInvoicesForSelectService = new GetInvoicesForSelectService();

export default defineComponent({
  name: 'MyQuotas',
  components: {
    AppRegisterPaymentInvoiceQuote,
    AppButton,
    AppDatatableColumn,
    AppFilter, AppBaseList, AppLoading, AppDatatable, AppIcon, AppModal, AppFormField,
  },

  setup() {
    const name = 'myQuotes';
    const title = 'Mis Cuotas';
    useMeta({title});
    const routes = [{name: title}];

    const getMyQuotasWithPaginationService = new GetMyQuotasWithPaginationService();

    const payModal = ref(false);
    const loading = ref(true);
    const invoiceId = ref();
    const statusId = ref();

    const currentQuota = ref<QuotaDto | null>();
    const invoices: { value: InvoiceDto[] } = reactive({
      value: [],
    });
    const status: { value: any } = reactive({
      value: [],
    });

    onMounted(async () => {
      status.value = [
        {id: 'pending', name: 'Pendiente'},
        {id: 'paid', name: 'Pagado'},
      ];

      loading.value = false;
    });

    const params = computed(() => {
      return {
        invoiceId: invoiceId.value,
        status: statusId.value,
      };
    });

    const searchInvoices = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        const response = await getInvoices(search);
        invoices.value = response.data;

        loading(false);
      }
    }, 800);

    const getInvoices = (search?: string) => {
      return getInvoicesForSelectService.run({
        search,
      });
    };

    const openPayModal = (quota: QuotaDto | null) => {
      currentQuota.value = quota;
      payModal.value = true;
    };

    const closePayModal = async () => {
      payModal.value = false;
    };

    return {
      name,
      title,
      routes,
      loading,

      getMyQuotasWithPaginationService,
      params,

      invoiceId,
      statusId,

      searchInvoices,

      invoices,
      status,

      openPayModal,
      closePayModal,
      currentQuota,
      payModal,
    };
  },
});
</script>

<style scoped>

</style>
