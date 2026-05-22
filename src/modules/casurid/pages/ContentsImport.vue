<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'casurid.contentsList' }"></AppButtonBack>
      <AppButton style="color: white;" :to="{ name: 'casurid.contentsImportCreate' }" label="core.new"></AppButton>
    </template>
    <template #content>
      <AppDatatable name="contentsImport" :service="getHistoryUploadContentService" :refresh-btn="true" default-sort="createdAt" default-sort-direction="desc">
        <AppDatatableColumn label="Fecha" field="createdAt" :sortable="true" v-slot="{ row }">
          {{ row.createdAt }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Estado" field="status" :sortable="true" v-slot="{ row }">
          <span
            class="badge"
            :class="{
              'bg-success': row.status === 'Terminado',
              'bg-warning': row.status !== 'Terminado',
            }"
          >
            {{ row.status }}
          </span>
        </AppDatatableColumn>

        <AppDatatableColumn label="Total contenidos" v-slot="{ row }">
          {{ row.jsonResponse ? JSON.parse(row.jsonResponse).length : 0 }}
        </AppDatatableColumn>

        <AppDatatableColumn label="OK" v-slot="{ row }">
          {{ row.jsonResponse ? JSON.parse(row.jsonResponse).filter((content) => content.status !== 'ERROR').length : 0 }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Con error" v-slot="{ row }">
          {{ row.jsonResponse ? JSON.parse(row.jsonResponse).filter((content) => content.status === 'ERROR').length : 0 }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }">
          <div class="btn-group" v-if="row.status === 'Validación'">
            <AppButtonEdit
              :to="{
                name: 'casurid.contentsImportEdit',
                params: { importId: row.id },
              }"
            ></AppButtonEdit>
          </div>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GetHistoryUploadContentService } from '../services/getHistoryUploadContent.service';
import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { useHeaderStore } from '../../../stores/header.store';

export default defineComponent({
  name: 'ContentsImport',
  components: {
    AppButtonBack,
    AppButtonEdit,
    AppDatatableColumn,
    AppDatatable,
    AppButton,
    AppBaseList,
  },
  setup() {
    const title = 'Historial importación de contenidos';
    const routes: BreadCrumbsType[] = [
      {
        name: 'Contenidos',
        url: {
          name: 'casurid.contentsList',
        },
      },
      {
        name: title,
      },
    ];
    const getHistoryUploadContentService = new GetHistoryUploadContentService();

    useMeta({
      title,
    });

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Casurid', url: '' };
    headerStorage.moduleItem = { name: 'Contenidos', url: '' };
    headerStorage.moduleSubItem = { name: title, url: '' };

    return {
      title,
      routes,
      getHistoryUploadContentService,
    };
  },
});
</script>

<style scoped></style>
