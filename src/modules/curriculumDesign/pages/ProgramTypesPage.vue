<template>
  <AppBaseList :title="t(title)">
    <template #actions>
      <AppCheckPermission permission="curriculum.programType.create">
        <AppButton style="color: white" label="core.new" @click="openModal()"></AppButton>
      </AppCheckPermission>
    </template>
    <template v-slot:content>
      <AppDatatable :service="service" name="programTypes" :tableTitle="t(tableTitle)">
        <AppDatatableColumn :label="t('Código')" field="code" v-slot="{ row }" sortable>
          <span class="fw-bold text-dark">{{ row.code }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Nombre')" field="name" v-slot="{ row }" sortable>
          {{ row.name }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Curricular')" field="isCurricular" v-slot="{ row }" sortable :position="'centered'">
          <span class="badge rounded-pill px-3 py-2" :class="row.isCurricular === 1 ? 'bg-success-light text-success' : 'bg-secondary-light text-secondary'">
            {{ row.isCurricular === 1 ? t('Sí') : t('No') }}
          </span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('Estado')" field="isActive" v-slot="{ row }" sortable :position="'centered'">
          <span class="badge rounded-pill px-3 py-2" :class="row.isActive === 1 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'">
            {{ row.isActive === 1 ? t('Activo') : t('No Activo') }}
          </span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('core.table.actions')" v-slot="{ row }" :position="'centered'" width="9rem">
          <div class="d-flex justify-content-center">
            <AppButtonGroup size="sm">
              <AppCheckPermission permission="curriculum.programType.edit">
                <AppButtonEdit @click="openModal(row)"></AppButtonEdit>
              </AppCheckPermission>

              <AppButton
                icon="sitemap"
                outlined
                variant="info"
                v-tooltip="t('Estructura')"
                size="sm"
                :to="{
                  name: 'curriculumDesign.levelTypeVersions',
                  params: {
                    programTypeId: row.id,
                  },
                }"
              ></AppButton>

              <AppCheckPermission permission="curriculum.programType.delete">
                <AppButtonDelete @click="openConfirmDelete(row)"></AppButtonDelete>
              </AppCheckPermission>
            </AppButtonGroup>
          </div>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="isModalVisible">
        <ProgramTypeFormModal v-if="isModalVisible" :item="selectedItem" @save="handleSave" />
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="t('Tipo de Programa')" @confirmDelete="confirmDelete" @close="closeDeleteModal"></AppConfirmDeleteModal>
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
import ProgramTypeFormModal from '../components/ProgramTypeFormModal.vue';

import { GetProgramTypesService } from '../services/getProgramTypes.service';
import { CreateOrUpdateProgramTypeService } from '../services/createOrUpdateProgramType.service';
import { DeleteProgramTypeService } from '../services/deleteProgramType.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

import type { ProgramTypeDto } from '../dtos/ProgramTypeDto';

const service = new GetProgramTypesService();
const createOrUpdateService = new CreateOrUpdateProgramTypeService();
const deleteService = new DeleteProgramTypeService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'ProgramTypesPage',

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
    ProgramTypeFormModal,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Tipos de Programas Académicos';
    const tableTitle = 'Tipos de Programas Académicos';

    useMeta({ title: t(title) });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Diseño Curricular', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const isModalVisible = ref(false);
    const selectedItem = ref<ProgramTypeDto | null>(null);

    const modalDelete = ref(false);
    const currentDeleteItem = ref<ProgramTypeDto | null>(null);

    const refreshData = () => {
      updateDatatableService.run();
    };

    const openModal = (item: ProgramTypeDto | null = null) => {
      selectedItem.value = item;
      isModalVisible.value = true;
    };

    const handleSave = async (form: ProgramTypeDto) => {
      try {
        const id = selectedItem.value?.id;
        await createOrUpdateService.run(form, id);
        isModalVisible.value = false;
        refreshData();
      } catch (error) {
        console.log(error);
      }
    };

    const openConfirmDelete = (item: ProgramTypeDto) => {
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
          await deleteService.run(currentDeleteItem.value.id ?? 0);
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

<style scoped>
.bg-success-light {
  background-color: #e6f4ea;
}
.bg-secondary-light {
  background-color: #f1f3f4;
}
.bg-danger-light {
  background-color: #fce8e6;
}
</style>
