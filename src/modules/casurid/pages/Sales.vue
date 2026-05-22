<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <AppDatatable :name="name" v-else :service="getSalesWithPaginationService" :params="params">
        <template #filters>
          <AppFilter v-model="institutionId" :filter-name="`${name}.institutionId`">
            <label for="institutionId">Institución</label>
            <v-select
              input-id="institutionId"
              v-model="institutionId"
              :filterable="false"
              @search="searchInstitutions"
              :options="institutions.value"
              label="name"
              :reduce="(institution) => institution.id"
            >
            </v-select>
          </AppFilter>

          <AppFilter v-model="statusId" :filter-name="`${name}.statusId`">
            <label for="statusId">Estado</label>
            <v-select input-id="statusId" v-model="statusId" :options="status.value" label="name" :reduce="(status) => status.id" multiple> </v-select>
          </AppFilter>

          <div class="d-flex flex-column flex-md-row align-items-md-center gap-2">
            <AppFilter v-model="dateSince" :filter-name="`${name}.dateSince`" @isNotInitialized="defaultDateSince">
              <label for="dateSince">Fecha inicial</label>
              <input type="date" class="form-control" id="dateSince" v-model="dateSince" />
            </AppFilter>

            <AppFilter v-model="dateUntil" :filter-name="`${name}.dateUntil`" @isNotInitialized="defaultDateUntil">
              <label for="dateUntil">Fecha final</label>
              <input type="date" class="form-control" id="dateUntil" v-model="dateUntil" />
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
          <div class="btn-group">
            <AppButtonEdit :to="{ name: 'casurid.salesEdit', params: { saleId: row.id } }"></AppButtonEdit>
            <AppButton v-if="!row.isCredit && row.status !== 'Pagada' && row.PendingValue > 0" variant="primary" outlined icon="dollar-sign" v-tooltip="'Pagar'" @click="showPaymentModal(row)">
            </AppButton>
          </div>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="paymentModal">
        <AddPaymentFromAdmin v-if="paymentModal" :sale="currentSale.value" @close="closePaymentModal"></AddPaymentFromAdmin>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce } from 'ts-debounce';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AddPaymentFromAdmin from '../components/addPaymentFromAdmin.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';

import { GetSalesWithPaginationService } from '../services/getSalesWithPagination.service';
import { GetStatusInstitutionsService } from '../services/getStatusInstitutions.service';
import { GetStartAndEndDateMonthService } from '../../../shared/services/getStartAndEndDateMonth.service';
import { InstitutionDto } from '../../../shared/dto/institution.dto';
import { GetInstitutionsForSelectService } from '../services/getInstitutionsForSelect.service';
import { SaleDto } from '../dtos/sale.dto';
import { VariantsConstant } from '../../../shared/constant/variants.constant';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { useHeaderStore } from '../../../stores/header.store';

const getStatusInstitutionsService = new GetStatusInstitutionsService();
const getStartAndEndDateMonthService = new GetStartAndEndDateMonthService();
const getInstitutionsForSelectService = new GetInstitutionsForSelectService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'SalesPage',
  components: {
    AppButton,
    AppDatatableColumn,
    AppFilter,
    AppBadge,
    AddPaymentFromAdmin,
    AppModal,
    AppButtonEdit,
    AppLoading,
    AppDatatable,
    AppBaseList,
  },
  setup() {
    const title = 'Ventas';
    const name = 'sales';
    const routes = [
      {
        name: title,
      },
    ];
    useMeta({
      title,
    });
    const { n } = useI18n();
    const status: { value: any } = reactive({
      value: [],
    });
    const loading = ref(true);
    const statusId = ref();
    const dateSince = ref();
    const dateUntil = ref();
    const institutionId = ref();
    const institutions: { value: InstitutionDto[] } = reactive({
      value: [],
    });

    const getSalesWithPaginationService = new GetSalesWithPaginationService();

    onMounted(async () => {
      status.value = await getStatusInstitutionsService.run();

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Casurid', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

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

    const params = computed(() => {
      return {
        status: statusId.value,
        dateSince: dateSince.value,
        dateUntil: dateUntil.value,
        institutionIdClient: institutionId.value,
      };
    });

    const searchInstitutions = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);
        const response = await getInstitutionsForSelectService.run({
          search,
          page: 1,
          perPage: 25,
        });
        institutions.value = response.data;
        loading(false);
      }
    }, 800);

    const paymentModal = ref(false);
    const currentSale: { value: SaleDto | null } = reactive({
      value: null,
    });

    const showPaymentModal = (sale: SaleDto) => {
      paymentModal.value = true;
      currentSale.value = sale;
    };

    const closePaymentModal = () => {
      paymentModal.value = false;
      updateDatatableService.run();
    };
    const buildStatusVariant = (status: string): VariantsConstant => {
      const colors: { [key: string]: VariantsConstant } = {
        Pagada: 'success',
        Anulado: 'danger',
        Cotización: 'secondary',
      };
      return colors[status] ?? 'warning';
    };

    return {
      name,
      title,
      routes,
      getSalesWithPaginationService,
      n,
      status,
      params,
      loading,
      statusId,
      dateSince,
      dateUntil,
      institutionId,
      institutions,
      paymentModal,
      currentSale,
      searchInstitutions,
      showPaymentModal,
      closePaymentModal,
      defaultDateSince,
      defaultDateUntil,
      buildStatusVariant,
    };
  },
});
</script>

<style scoped></style>
