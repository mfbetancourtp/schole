<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton
      style="color: white;"
        :label="'core.newFemale'" @click="openFormTableRecordModal()"
      ></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <AppDatatable v-else :service="getItemsRecordsWithPaginationService" :params="params" :name="name">
        <template #filters>
            <AppFilter v-model="moduleId" filter-name="example">
              <label for="moduleId">Modulo</label>
              <v-select input-id="moduleId" 
                :filterable="false"
                v-model="moduleId" 
                :options="modules.value"
                @search="searchModules"
                :reduce = "(module) => module.id"
                label="name" 
                >
              </v-select>
            </AppFilter>

            <AppFilter v-model="menuId" filter-name="example2">
              <label for="menuId">Menu</label>
              <v-select input-id="menuId" 
                v-model="menuId" 
                :options="optionsFilter"
                :reduce = "(menu) => menu.value"
                label="label"
                >
              </v-select>      
            </AppFilter>

            <AppFilter v-model="reportId" filter-name="example1">
              <label for="reportId">Reporte</label>
              <v-select input-id="reportId" 
                v-model="reportId" 
                :options="optionsFilter2"
                :reduce = "(report) => report.value"
                label="label" 
                >
              </v-select>     
            </AppFilter>    

          </template>
        <AppDatatableColumn label="Modulo" field="" :sortable="true" v-slot="{row}">
          {{ row.module }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Codigo" field="" :sortable="true" v-slot="{row}">
          {{ row.code }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Nombre" field="" :sortable="true" v-slot="{row}">
          {{ row.name }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Ruta" field="" :sortable="true" v-slot="{ row }">
          {{ row.route }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Estado" field="" :sortable="true" v-slot="{row}">
          <input 
            class="form-check-input" 
            :checked="!!row.isActive" 
            @click="statusUpdate(row)"
            type="checkbox">
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="core.actions">
          <AppButtonGroup>
            <AppButton 
              icon="arrow-up"
              @click="setOrder(row.id, 0)"
            ></AppButton>
            <AppButton 
              icon="arrow-down"
              @click="setOrder(row.id, 1)"
            ></AppButton>
            <AppButtonEdit
              @click="openFormTableRecordModal(row.id)"
            ></AppButtonEdit>

            <AppButtonDelete
              @click="openModalDelete(row.id)"
            ></AppButtonDelete>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="formTableRecordModal">
        <FormTableRecords
          v-if="formTableRecordModal"
          :TableRecord="currentTableRecord"
          @close="closeFormTableRecordModal"
        ></FormTableRecords>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal 
          v-if="modalDelete" 
          entity="access.medicalRecord.singular" 
          @confirmDelete="deleteItemRecord"
        ></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref } from "vue";
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from "@vuelidate/core";
import {debounce} from 'ts-debounce';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppFilter from '../../../shared/components/AppFilter.vue';
import FormTableRecords from '../components/FormTableRecords.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import {TableRecordDto} from '../dtos/modules.dto';

import {SetItemsRecordsOrderService} from '../services/setItemsRecordsOrder.service'
import {GetListModulesService} from '../services/getListModules.service'
import { DeleteAcademicPeriodService } from '../services/deleteItemRecord.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetItemsRecordsWithPaginationService } from '../services/getItemsRecordsWithPagination.service';
import { GetItemsRecordsByIdService } from '../services/getItemsRecordsById.service';
import { SetItemsRecordsStateService } from '../services/setItemsRecordsState.service';

const getItemsRecordsWithPaginationService = new GetItemsRecordsWithPaginationService();
const deleteAcademicPeriodService = new DeleteAcademicPeriodService();
const updateDatatableService = new UpdateDatatableService();
const getListModulesService = new GetListModulesService();
const getItemsRecordsByIdService = new GetItemsRecordsByIdService();
const setItemsRecordsOrderService = new SetItemsRecordsOrderService();
const setItemsRecordsStateService = new SetItemsRecordsStateService();

export default defineComponent({
  name: "ConfigureMenu",
  components: {
    AppConfirmDeleteModal,
    AppDatatableColumn,
    FormTableRecords,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppButton,
    AppFilter,
    AppModal,
  },

  setup() {

    const { t } = useI18n();
    const title = "Administrar items del menu";
    const routes = [{ name: title }];
    useMeta({ title: t(title) });
  
    const modules: {value : any } = reactive({ 
      value:[]
    });
    const loading = ref(true);
    const moduleId = ref();
    const menuId = ref();
    const reportId = ref();
    const itemTableId = ref();
    const currentTableRecord: Ref<any | null> = ref(null);
    const formTableRecordModal = ref(false);

    const active: { value: boolean } = reactive({
      value: false,
    });    
    const optionsFilter = [
      {
        label : "Si",
        value : 1
      },
      {
        label : "no",
        value : 0
      }
    ];
    const optionsFilter2 = [
      {
        label : "Si",
        value : 1
      },
      {
        label : "no",
        value : 0
      }
    ];
      
    const form = reactive({
      showMenu : null,
      isReport : null,
    })

    const v$ = useVuelidate({
      form: {
        isReport: {},
        showMenu: {},
      },
    }, {form});

    const modalDelete = ref(false);

    onMounted(async () => {
      loading.value = false;
    });

    const openFormTableRecordModal = async (itemTableId : number | null = null) => {
      let dataResponse = await getItemsRecordsByIdService.run(itemTableId)
      currentTableRecord.value = dataResponse[0];
      formTableRecordModal.value = true;
    };

    const closeFormTableRecordModal = async () => {
      formTableRecordModal.value = false;
      updateDatatableService.run();
    };

    const openModalDelete = (itemRecorId: number) => {
      modalDelete.value = true;
      itemTableId.value = itemRecorId;
    };

    const deleteItemRecord = async () => {
      try {
        await deleteAcademicPeriodService.run(itemTableId.value);

        modalDelete.value = false;
        updateDatatableService.run();
      } catch (e) {}
    };
   
    const searchModules = debounce(async (search: string, loading: Function) => {
      if(search){
        loading(true);
        const response = await getModules(search);
        modules.value = response.data;
        loading(false);
      }
    }, 800);

    const getModules = (search?: string) => {
      return getListModulesService.run({
        search,
      });
    };

    const setOrder = async (itemId : number, isUpwards: number) => {
      try{
        loading.value = true;
        await setItemsRecordsOrderService.run(itemId, isUpwards)
        loading.value = false;
      } catch (e) {}
      loading.value = false;
    };

    const statusUpdate = async (itemRecord: TableRecordDto) => {
      try {
        itemRecord.isActive = itemRecord.isActive ? 0 : 1;
        await setItemsRecordsStateService.run(itemRecord.id, itemRecord.isActive);
        console.log('listado en tabla: ', getItemsRecordsWithPaginationService.run(params.value))
      } catch (e) {}
    };

    const params = computed(() => {
      return{
        moduleId : moduleId.value,
        isReport : reportId.value,
        showMenu : menuId.value,
      }
    });

    return {
      routes,
      title,
      v$,
      t,
      
      active,
      params,
      menuId,
      modules,
      loading,
      moduleId,
      reportId,

      getItemsRecordsWithPaginationService,
      formTableRecordModal,
      currentTableRecord,
      optionsFilter2,
      optionsFilter,
      modalDelete,
      name,

      closeFormTableRecordModal,
      openFormTableRecordModal,
      deleteItemRecord,
      openModalDelete,
      searchModules,
      statusUpdate,
      setOrder,
    };
  },
});
</script>

<style scoped>
</style>