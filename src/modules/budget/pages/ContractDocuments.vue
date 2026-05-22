<template>
  <AppBaseList :title="title" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButton :label="'core.new'" @click="openModalContratcDocument" style="color: white"></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="container-tables">
          <div class="d-flex flex-wrap align-items-center mb-4">
            <!-- Título centrado -->
            <h3 class="bg-white fw-bold px-3 py-1" style="color: var(--color-primary)">
              {{ title }}
            </h3>
            <div class="ms-auto tw-flex tw-justify-end">
              <div class="mb-3 md:tw-w-72 tw-w-full">
                <label>{{ t('Categoría') }}</label>
                <AppAutocomplete v-model="categoryId" :options="categories" :label="'value'" :clearable="false" :reduce="(d:any) => d.label" class="bg-white"> </AppAutocomplete>
              </div>
            </div>
          </div>

          <AppLoading v-if="loadingTable"></AppLoading>

          <div v-else class="table-responsive" style="overflow-x: auto">
            <AppDatatable :name="title" :data="documentBudgets" :filterKeyLocal="'name'">
              <AppDatatableColumn label="core.menu.name" :sortable="true" v-slot="{ row }">
                {{ row.name }}
              </AppDatatableColumn>

              <AppDatatableColumn label="Descripción" :sortable="true" v-slot="{ row }">
                {{ row.description }}
              </AppDatatableColumn>

              <AppDatatableColumn label="core.actions" :sortable="true" v-slot="{ row }" :position="'centered'">
                <AppButtonGroup class="d-flex justify-content-center">
                  <AppButtonEdit @click="openModalContratcDocument(row)"></AppButtonEdit>
                  <AppButtonDelete @click="openModalDeleteDocument(row)"></AppButtonDelete>
                </AppButtonGroup>
              </AppDatatableColumn>
            </AppDatatable>
          </div>
        </div>
      </template>
      <AppModal v-model="modalDeleteDocument">
        <AppConfirmDeleteModal v-if="modalDeleteDocument" :entity="currentDocumnet?.name" @confirmDelete="deleteDocument"> </AppConfirmDeleteModal>
      </AppModal>
      <AppModal v-model="modalContractDocument">
        <ContractDocumentModal v-if="modalContractDocument" :data="currentDocumnet" @close="closeModalDocument" :categoryId="categoryId"></ContractDocumentModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch, computed } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import ContractDocumentModal from '../components/ContractDocumentModal.vue';
import { documentBudgetDto } from '../dtos/documentBudget.dto';
import { useHeaderStore } from '../../../stores/header.store';

import { GetDocumentsBudgetsCategoriesService } from '../services/getDocumentsBudgetsCategories.service';
import { GetDocumentsBudgetsService } from '../services/getDocumentsBudgets.service';
import { DeleteDocumentsBudgetsService } from '../services/deleteDocumentsBudgets.service';

const getDocumentsBudgetsCategoriesService = new GetDocumentsBudgetsCategoriesService();
const getDocumentsBudgetsService = new GetDocumentsBudgetsService();
const deleteDocumentsBudgetsService = new DeleteDocumentsBudgetsService();
export default defineComponent({
  name: 'ContractDocumentsPage',
  components: {
    AppAutocomplete,
    AppButton,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButtonGroup,
    AppDatatable,
    AppDatatableColumn,
    AppButtonDelete,
    AppModal,
    AppConfirmDeleteModal,
    ContractDocumentModal,
  },

  setup() {
    const { t } = useI18n();
    const title = t('core.menu.contractDocuments');

    useMeta({ title: t(title) });

    const subtitle: Ref<string> = ref('');
    const documentBudgets = ref<documentBudgetDto[]>([]);
    const currentDocumnet = ref<documentBudgetDto | null>(null);
    const categoryId = ref<any>();
    const loading = ref(true);
    const loadingTable = ref(true);
    const modalDeleteDocument = ref(false);
    const modalContractDocument = ref(false);
    const categories = ref<any>([]);

    const params = computed<{ categoryId: number }>(() => ({
      categoryId: categoryId.value,
    }));

    onMounted(async () => {
      try {
        categories.value = await getDocumentsBudgetsCategoriesService.run();
        categoryId.value = categories.value?.[0]?.label ?? null;
        documentBudgets.value = await getDocumentsBudgetsService.run(params.value);

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'core.menu.budget', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = {
          name: '',
          url: '',
        };
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
      loadingTable.value = false;
    });

    watch(categoryId, async () => {
      reloadData();
    });

    const reloadData = async () => {
      try {
        loadingTable.value = true;
        documentBudgets.value = await getDocumentsBudgetsService.run(params.value);
        loadingTable.value = false;
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    };
    const openModalContratcDocument = (dataSelected: documentBudgetDto | null) => {
      modalContractDocument.value = true;
      currentDocumnet.value = dataSelected;
    };
    const openModalDeleteDocument = (dataSelected: documentBudgetDto) => {
      modalDeleteDocument.value = true;
      currentDocumnet.value = dataSelected;
    };
    const deleteDocument = async () => {
      try {
        await deleteDocumentsBudgetsService.run(currentDocumnet.value?.id);
        await closeModalDocument();
      } catch (e) {
        console.log('This is error', e);
        loading.value = false;
      }
    };
    const closeModalDocument = async () => {
      modalDeleteDocument.value = false;
      modalContractDocument.value = false;
      reloadData();
    };

    return {
      params,
      subtitle,
      loading,
      title,
      t,
      loadingTable,
      categoryId,
      categories,
      documentBudgets,
      modalDeleteDocument,
      deleteDocument,
      openModalDeleteDocument,
      currentDocumnet,
      openModalContratcDocument,
      modalContractDocument,
      closeModalDocument,
    };
  },
});
</script>

<style scoped>
.container-tables {
  background-color: white;
  padding: 23px 22px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

.table-responsive {
  overflow-x: auto;
}
</style>
