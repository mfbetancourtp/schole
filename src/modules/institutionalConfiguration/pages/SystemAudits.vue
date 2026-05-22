<template>
  <AppBaseList>
    <template v-slot:content>
      <AppLoading v-if="loading" />

      <AppDatatable v-else :name="name" :service="service" :params="params" refreshBtn>
        <template #filters>
          <AppFilter v-model="actions" filter-name="systemAudits.actions">
            <label for="academicPeriodId">{{ t('Acción') }}</label>

            <v-select input-id="actions" :options="relationships.actions" label="label" :reduce="(relationships: any) => relationships.label" v-model="actions"></v-select>
          </AppFilter>

          <AppFilter v-model="actions" filter-name="systemAudits.object">
            <label for="academicPeriodId">{{ t('Objeto de auditoria') }}</label>

            <v-select input-id="object" :options="relationships.objects" label="label" :reduce="(relationships: any) => relationships.label" v-model="object"></v-select>
          </AppFilter>
        </template>

        <AppDatatableColumn :label="t('Usuario')" field="lastnames" v-slot="{ row }">
          <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
            <AppAvatar :size="'sm'" :name="row.userLastnames ?? '?'"></AppAvatar>

            <div class="tw-min-w-0 tw-ml-4">
              <div class="tw-font-medium tw-leading-5 tw-truncate">
                {{ row.userLastnames }}
              </div>
              <div class="tw-leading-5 tw-truncate tw-font-light">
                {{ row.userNames }}
              </div>
            </div>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('ID')" field="id" v-slot="{ row }">
          {{ row.id }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Acción')" field="action" v-slot="{ row }">
          {{ row.action }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Descripción')" field="Descriptión" v-slot="{ row }">
          {{ row.description }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Objeto de Auditoria')" field="object" v-slot="{ row }">
          {{ row.object }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Fecha')" field="createdAt" v-slot="{ row }">
          {{ dayjs.utc(row.createdAt).locale('es').subtract(5, 'hour').format('DD/MM/YY hh:mm A') }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" :label="t('Ip')" field="ip">
          {{ row.ip }}
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

import { useHeaderStore } from '../../../stores/header.store';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { GetActionsAndObjectsservice } from '../services/getActionsAndObjects.service';
import { GetSystemAuditsWithPaginationservice } from '../services/getSystemAuditsWithPagination.service';

const getActionsAndObjectsservice = new GetActionsAndObjectsservice();

dayjs.locale('es');
dayjs.extend(utc);

export default defineComponent({
  name: 'SystemAudits',

  components: {
    AppDatatableColumn,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppAvatar,
    AppFilter,
  },

  setup() {
    const { t } = useI18n();

    const title = 'Auditorias';

    useMeta({ title: title });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Configuración institucional', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const actions = ref(null);
    const object = ref(null);
    const relationships = ref();

    const loading = ref(true);

    const name = 'SystemAuditsDT';
    const service = new GetSystemAuditsWithPaginationservice();
    const params = computed(() => {
      return {
        action: actions.value,
        object: object.value,
        order: 'desc',
        sort: 'id',
      };
    });

    onMounted(async () => {
      try {
        let relatedDataForm = await getActionsAndObjectsservice.run();
        relationships.value = relatedDataForm;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      title,
      dayjs,
      t,

      service,
      params,
      name,

      loading,

      relationships,
      actions,
      object,
    };
  },
});
</script>
