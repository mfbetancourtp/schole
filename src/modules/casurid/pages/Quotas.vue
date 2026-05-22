<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <AppDatatable v-else :name="name" :service="getQuotasWithPaginationService" :params="params">
        <template v-slot:filters>
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
              multiple
            >
            </v-select>
          </AppFilter>

          <AppFilter v-model="invoiceId" :filter-name="`${name}.invoiceId`">
            <label for="invoiceId">Recibo</label>
            <v-select input-id="invoiceId" v-model="invoiceId" :filterable="false" @search="searchInvoices" :options="invoices.value" label="code" :reduce="(invoice) => invoice.id" multiple>
            </v-select>
          </AppFilter>

          <AppFilter v-model="status" :filter-name="`${name}.status`">
            <label for="status">Estado</label>
            <v-select input-id="status" v-model="statusId" class="tw-flex-1" :options="status.value" label="name" :reduce="(status) => status.id" multiple> </v-select>
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

        <AppDatatableColumn label="Institución" field="clientInstitution" :sortable="true" v-slot="{ row }">
          {{ row.clientInstitution }}
        </AppDatatableColumn>

        <AppDatatableColumn label="No. Cuota" field="codeQuote" :sortable="true" v-slot="{ row }">
          {{ row.codeQuote }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Fecha vencimiento" field="dueDate" :sortable="true" v-slot="{ row }">
          {{ row.dueDate }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Valor" field="quoteValue" :sortable="true" v-slot="{ row }">
          {{ n(row.quoteValue, 'currency') }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Saldo" field="PendingValue" :sortable="true" v-slot="{ row }">
          {{ n(row.PendingValue, 'currency') }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="statusQuote" :sortable="true" v-slot="{ row }">
          {{ row.statusQuote }}
        </AppDatatableColumn>

        <!--        <AppDatatableColumn v-slot="{ row }">
                  <router-link to="#" class="btn btn-outline-primary"
                               v-tooltip="'Pagar'"
                  >
                    <AppIcon icon="shopping-cart" size="lg" class="blue"/>
                  </router-link>
                </AppDatatableColumn>-->
      </AppDatatable>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { debounce } from 'ts-debounce';
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { GetInvoicesForSelectService } from '../services/getInvoicesForSelect.service';
import { GetQuotasWithPaginationService } from '../services/getQuotasWithPagination.service';
import { GetInstitutionsForSelectService } from '../services/getInstitutionsForSelect.service';
import { GetStartAndEndDateMonthService } from '../../../shared/services/getStartAndEndDateMonth.service';

import { InvoiceDto } from '../dtos/invoice.dto';
import { InstitutionDto } from '../dtos/institution.dto';
import { useI18n } from 'vue-i18n';
import { useHeaderStore } from '../../../stores/header.store';

const getInvoicesForSelectService = new GetInvoicesForSelectService();
const getStartAndEndDateMonthService = new GetStartAndEndDateMonthService();
const getInstitutionsForSelectService = new GetInstitutionsForSelectService();

export default defineComponent({
  name: 'QuotasPage',
  components: {
    AppDatatableColumn,
    AppFilter,
    AppBaseList,
    AppDatatable,
    AppLoading,
  },

  setup() {
    const title = 'Cuotas';
    const name = 'quotas';
    useMeta({ title });
    const routes = [{ name: title }];
    const { n } = useI18n();

    const getQuotasWithPaginationService = new GetQuotasWithPaginationService();

    const institutionId = ref();
    const loading = ref(true);
    const invoiceId = ref();
    const dateSince = ref();
    const dateUntil = ref();
    const statusId = ref();

    const institutions: { value: InstitutionDto[] } = reactive({
      value: [],
    });
    const invoices: { value: InvoiceDto[] } = reactive({
      value: [],
    });
    const status: { value: any } = reactive({
      value: [],
    });

    onMounted(async () => {
      status.value = [
        { id: 'paid', name: 'Pagado' },
        { id: 'pending', name: 'Pendiente' },
      ];

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
        invoiceId: invoiceId.value,
        dateSince: dateSince.value,
        dateUntil: dateUntil.value,
        institutionIdClient: institutionId.value,
      };
    });

    const searchInstitutions = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        const response = await getInstitutions(search);
        institutions.value = response.data;

        loading(false);
      }
    }, 800);

    const searchInvoices = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        const response = await getInvoices(search);
        invoices.value = response.data;

        loading(false);
      }
    }, 800);

    const getInstitutions = (search?: string) => {
      return getInstitutionsForSelectService.run({
        search,
      });
    };

    const getInvoices = (search?: string) => {
      return getInvoicesForSelectService.run({
        search,
      });
    };

    return {
      name,
      title,
      routes,

      getQuotasWithPaginationService,
      params,

      institutionId,
      invoiceId,
      dateSince,
      dateUntil,
      statusId,
      loading,

      n,
      searchInstitutions,
      searchInvoices,
      defaultDateSince,
      defaultDateUntil,

      institutions,
      invoices,
      status,
    };
  },
});
</script>

<style scoped></style>
