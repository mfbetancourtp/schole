<template>
  <AppBaseList :title="t(title)">
    <template #actions>
      <AppCheckPermission permission="curriculum.format.create">
        <AppButton style="color: white" label="core.new" @click="openModal()"></AppButton>
      </AppCheckPermission>
    </template>
    <template v-slot:content>
      <AppDatatable :service="service" name="curriculumFormats" :tableTitle="t(tableTitle)">
        <AppDatatableColumn :label="t('Código')" field="code" v-slot="{ row }" sortable>
          <span class="fw-bold text-dark">{{ row.code }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Nombre')" field="name" v-slot="{ row }" sortable>
          {{ row.name }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('core.table.actions')" v-slot="{ row }" :position="'centered'" width="9rem">
          <div class="d-flex justify-content-center">
            <AppButtonGroup size="sm">
              <AppCheckPermission permission="curriculum.format.edit">
                <AppButtonEdit @click="openModal(row)"></AppButtonEdit>
              </AppCheckPermission>

              <AppCheckPermission permission="curriculum.format.delete">
                <AppButtonDelete @click="openConfirmDelete(row)"></AppButtonDelete>
              </AppCheckPermission>
            </AppButtonGroup>
          </div>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="isModalVisible">
        <FormatFormModal v-if="isModalVisible" :item="selectedItem" @save="handleSave" />
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="t('Formato')" @confirmDelete="confirmDelete" @close="closeDeleteModal"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import FormatFormModal from '../components/FormatFormModal.vue';

import { GetFormatsService } from '../services/getFormats.service';
import { CreateOrUpdateFormatService } from '../services/createOrUpdateFormat.service';
import { DeleteFormatService } from '../services/deleteFormat.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

import type { CurriculumFormatDto } from '../dtos/CurriculumFormatDto';

const service = new GetFormatsService();
const createOrUpdateService = new CreateOrUpdateFormatService();
const deleteService = new DeleteFormatService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'FormatPage',

  components: {
    AppBaseList,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppButtonGroup,
    AppDatatable,
    AppDatatableColumn,
    AppCheckPermission,
    AppModal,
    AppConfirmDeleteModal,
    FormatFormModal,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Formatos Curriculares';
    const tableTitle = 'Listado de Formatos';

    useMeta({ title: t(title) });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Diseño Curricular', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const isModalVisible = ref(false);
    const selectedItem = ref<CurriculumFormatDto | null>(null);

    const modalDelete = ref(false);
    const currentDeleteItem = ref<CurriculumFormatDto | null>(null);

    const refreshData = () => {
      updateDatatableService.run();
    };

    const openModal = (item: CurriculumFormatDto | null = null) => {
      selectedItem.value = item;
      isModalVisible.value = true;
    };

    const handleSave = async (form: CurriculumFormatDto) => {
      try {
        const id = selectedItem.value?.id;
        await createOrUpdateService.run(form, id);
        isModalVisible.value = false;
        refreshData();
      } catch (error) {
        console.log(error);
      }
    };

    const openConfirmDelete = (item: CurriculumFormatDto) => {
      currentDeleteItem.value = item;
      modalDelete.value = true;
    };

    const closeDeleteModal = () => {
      modalDelete.value = false;
      currentDeleteItem.value = null;
    };

    const confirmDelete = async () => {
      try {
        if (currentDeleteItem.value) {
          await deleteService.run(currentDeleteItem.value.id);
          refreshData();
        }
      } catch (error) {
        console.log(error);
      } finally {
        closeDeleteModal();
      }
    };

    watch(isModalVisible, (value) => {
      if (!value) {
        selectedItem.value = null;
      }
    });

    watch(modalDelete, (value) => {
      if (!value) {
        currentDeleteItem.value = null;
      }
    });

    return {
      t,
      title,
      tableTitle,
      service,
      isModalVisible,
      selectedItem,
      modalDelete,
      openModal,
      handleSave,
      openConfirmDelete,
      closeDeleteModal,
      confirmDelete,
    };
  },
});
</script>
