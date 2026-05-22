<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title">
    <template #actions>
      <AppCheckPermission permission="physicalResources.qrs.create">
        <AppButton
          style="color: #fff"
          label="core.new"
          :to="{ name: 'physicalResources.qrsCreate' }"
        ></AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <div style="margin-bottom: 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <QrPdfExporter ref="pdfExporter" :params="params" :selected-rows="selectedRows" />
        <span v-if="selectedRows.length" style="font-size: 0.85rem; color: #6b7280; display: flex; align-items: center; gap: 8px;">
          {{ selectedRows.length }} seleccionado(s)
          <button
            @click="selectedRows = []"
            style="background: none; border: none; cursor: pointer; color: #ef4444; font-size: 0.8rem; text-decoration: underline; padding: 0;"
          >Limpiar selección</button>
        </span>
      </div>
      <AppDatatable
        name="qrs"
        :service="getQrsWithPaginationService"
        :params="params"
      >
        <template #filters>
          <AppFilter v-model="aulaId" filter-name="qrs.aulaId">
            <label for="aulaId">aula</label>
            <v-select
              input-id="aulaId"
              :options="aulaData"
              label="name"
              :reduce="(aula:any) => aula.id"
              v-model="aulaId"
              :appendToBody="true"
            ></v-select>
          </AppFilter>
          <AppFilter v-model="campusId" filter-name="qrs.campusId">
            <label for="campusId">campus</label>
            <v-select
              input-id="campusId"
              :options="campusData"
              label="name"
              :reduce="(campus:any) => campus.id"
              v-model="campusId"
              :appendToBody="true"
            ></v-select>
          </AppFilter>
          <AppFilter v-model="edificioId" filter-name="qrs.edificioId">
            <label for="edificioId">edificio</label>
            <v-select
              input-id="edificioId"
              :options="edificioData"
              label="name"
              :reduce="(edificio:any) => edificio.id"
              v-model="edificioId"
              :appendToBody="true"
            ></v-select>
          </AppFilter>
        </template>

        <AppDatatableColumn label="" v-slot="{ row }" style="width: 40px;">
          <input
            type="checkbox"
            :checked="selectedRows.some((r: any) => r.id === row.id)"
            @change="toggleRow(row)"
            style="width: 16px; height: 16px; cursor: pointer;"
          />
        </AppDatatableColumn>

        <AppDatatableColumn
          label="AULA"
          v-slot="{ row }"
          field="classroom.name"
          :sortable="true"
        >
          {{ row.name }}
          <p
            class="m-0 text-muted"
            style="font-size: 0.9rem"
            v-if="row.courseGroup"
          >
            ( {{ row.Floors }} )
          </p>
        </AppDatatableColumn>

        <AppDatatableColumn
          label="CAMPUS"
          v-slot="{ row }"
          field="campus.name"
          :sortable="true"
        >
          {{ row.campus?.name || row.campus }}
        </AppDatatableColumn>

        <AppDatatableColumn
          label="EDIFICIO"
          v-slot="{ row }"
          field="building.name"
          :sortable="true"
        >
          {{ row.building?.name || row.edificio }}
        </AppDatatableColumn>

        <AppDatatableColumn
          label="DESCRIPCION"
          v-slot="{ row }"
          field="description"
          :sortable="true"
        >
          {{ row.description }}
        </AppDatatableColumn>

        <AppDatatableColumn
          label="FECHA CREACIÓN"
          v-slot="{ row }"
          field="createdAt"
          :sortable="true"
        >
          <span
            :class="{
              'text-muted':
                row.createdAt === 'Qr no generado' || !row.createdAt,
            }"
          >
            {{ row.createdAt || 'Qr no generado' }}
          </span>
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }">
          <div style="display: flex; gap: 6px; align-items: center;">
            <AppButton
              icon="file-pdf"
              variant="secondary"
              title="Descargar PDF"
              @click="handleDownloadOne(row)"
            />
            <AppCheckPermission permission="physicalResources.qrs.edit">
              <AppButtonEdit
                :to="{
                  name: 'physicalResources.qrsedit',
                  params: { userId: row.id },
                }"
              ></AppButtonEdit>
            </AppCheckPermission>
          </div>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>
</template>

<script lang="ts">

import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useMeta } from 'vue-meta';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetQrsWithPaginationService } from '../services/getQrsWithPaginationService';
import { RoleDto } from '../../../shared/dto/role.dto';
import { useHeaderStore } from '../../../stores/header.store';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { GetCampusesService } from '../services/getCampuses.service';
import { GetBuildingsByCampusService } from '../services/getBuildingsByCampus.service';
import { GetFloorsByBuildingService } from '../services/getFloorsByBuilding.service';
import QrPdfExporter from '../components/QrPdfExporter.vue';

const getCampusesService = new GetCampusesService();
const getBuildingsService = new GetBuildingsByCampusService();
const getFloorsService = new GetFloorsByBuildingService();

export default defineComponent({
  name: 'AdminQrsPage',
  components: {
    vSelect,
    AppButton,
    AppBadge,
    AppFilter,
    AppDatatableColumn,
    AppLoading,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppCheckPermission,
    AppAutocomplete,
    QrPdfExporter,
  },
  setup() {
    const title = 'AdminQrs';
    const getQrsWithPaginationService = new GetQrsWithPaginationService();
    const loading = ref(true);
    const pdfExporter = ref<InstanceType<typeof QrPdfExporter> | null>(null);
    const aulaId: Ref<number | null> = ref(null);
    const campusId: Ref<number | null> = ref(null);
    const edificioId: Ref<number | null> = ref(null);
    const roleId: Ref<number | null> = ref(null);
    const aulaData: Ref<any[]> = ref([]);
    const campusData: Ref<any[]> = ref([]);
    const edificioData: Ref<any[]> = ref([]);

    useMeta({
      title,
    });

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Administración de qrs', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      aulaData.value = await getFloorsService.run();
      campusData.value = await getCampusesService.run();
      edificioData.value = await getBuildingsService.run();
      
      const localfilters: any = JSON.parse(
        localStorage.getItem('filters') ?? '{}'
      );

       if (localfilters && !!localfilters['qrs.aulaId']) {
        if (aulaData.value.length)
          aulaId.value = localfilters['qrs.aulaId'] as number[];
      }

      if (localfilters && !!localfilters['qrs.campusId']) {
        if (campusData.value.length)
          campusId.value = localfilters['qrs.campusId'] as number[];
      }

      if (localfilters && !!localfilters['qrs.edificioId']) {
        if (edificioData.value.length)
          edificioId.value = localfilters['qrs.edificioId'] as number[];
      }

      loading.value = false;
    });
    
    const params = computed(() => ({
      buildingId: roleId.value,
      aulaId: aulaId.value,
      campusId: campusId.value,
      edificioId: edificioId.value,
    }));

    const selectedRows: Ref<any[]> = ref([]);

    const toggleRow = (row: any) => {
      const idx = selectedRows.value.findIndex((r) => r.id === row.id);
      if (idx === -1) selectedRows.value.push(row);
      else selectedRows.value.splice(idx, 1);
    };

    const handleDownloadOne = (row: any) => {
      pdfExporter.value?.downloadOne(row);
    };

    return {
      title,
      getQrsWithPaginationService,
      loading,
      pdfExporter,
      aulaId,
      campusId,
      edificioId,
      aulaData,
      campusData,
      edificioData,
      params,
      selectedRows,
      toggleRow,
      handleDownloadOne,
    };
  },
});
</script>