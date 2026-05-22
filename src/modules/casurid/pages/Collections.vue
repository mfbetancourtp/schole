<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <AppDatatable v-else :name="name" :service="getCollectionsWithPaginationService" :params="params">
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
            <v-select input-id="invoiceId" v-model="invoiceId" :filterable="false" @search="searchInvoices" :options="invoices.value" label="id" :reduce="(invoice) => invoice.id" multiple> </v-select>
          </AppFilter>

          <AppFilter v-model="statusId" :filter-name="`${name}.status`">
            <label for="status">Estado</label>
            <v-select input-id="status" v-model="statusId" :options="status.value" label="name" :reduce="(status) => status.id" multiple> </v-select>
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

        <AppDatatableColumn label="Institución" field="institutionName" :sortable="true" v-slot="{ row }">
          {{ row.institutionName }}
        </AppDatatableColumn>

        <AppDatatableColumn label="No. Recibo" field="invoiceId" :sortable="true" v-slot="{ row }">
          {{ row.invoiceId }}
        </AppDatatableColumn>

        <AppDatatableColumn label="# Transacción" field="code" :sortable="true" v-slot="{ row }">
          {{ row.code }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Fecha" field="date" :sortable="true" v-slot="{ row }">
          {{ row.date }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Valor" field="value" :sortable="true" v-slot="{ row }">
          {{ row.value }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="stateGateway" :sortable="true" v-slot="{ row }">
          {{ row.stateGateway }}
        </AppDatatableColumn>
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
import { GetInstitutionsForSelectService } from '../services/getInstitutionsForSelect.service';
import { GetCollectionsWithPaginationService } from '../services/getCollectionsWithPagination.service';
import { GetStartAndEndDateMonthService } from '../../../shared/services/getStartAndEndDateMonth.service';

import { InvoiceDto } from '../dtos/invoice.dto';
import { InstitutionDto } from '../dtos/institution.dto';
import { useHeaderStore } from '../../../stores/header.store';

const getInvoicesForSelectService = new GetInvoicesForSelectService();
const getStartAndEndDateMonthService = new GetStartAndEndDateMonthService();
const getInstitutionsForSelectService = new GetInstitutionsForSelectService();

export default defineComponent({
  name: 'CollectionsPage',
  components: {
    AppDatatableColumn,
    AppFilter,
    AppBaseList,
    AppLoading,
    AppDatatable,
  },

  setup() {
    const name = 'collections';
    const title = 'Recaudos';
    useMeta({ title });
    const routes = [{ name: title }];

    const getCollectionsWithPaginationService = new GetCollectionsWithPaginationService();

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
      loading,

      getCollectionsWithPaginationService,
      params,

      institutionId,
      invoiceId,
      dateSince,
      dateUntil,
      statusId,

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
