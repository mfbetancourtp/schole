<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButton style="color: white;" label="core.new" @click="openBudgetCategoriesForm(null)"></AppButton>
    </template>

    <template v-slot:content>
      <AppDatatable :service="serviceDatatable" :params="{}" :name="name">
        <AppDatatableColumn label="Nombre" field="budgetCategories.name" :sortable="true" v-slot="{ row }">
          {{ row.name }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Valor por defecto" :sortable="true" v-slot="{ row }">
          {{ row.defaultValue }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Medida" :sortable="true" v-slot="{ row }">
          {{ row.measure }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }">
          <AppButtonGroup>
            <AppButtonEdit @click="openBudgetCategoriesForm(row)"></AppButtonEdit>

            <AppButtonDelete @click="openConfirmDelete(row.id)"></AppButtonDelete>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="budgetCategorieModal" :size="'lg'">
        <BudgetCategoriesForm v-if="budgetCategorieModal" :data="currentBudgetCategorie" @close="closeBudgetCategoriesForm"></BudgetCategoriesForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Concepto" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import BudgetCategoriesForm from '../components/BudgetCategoriesForm.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { DeleteBudgetCategoriesService } from '../services/deleteBudgetCategories.service';
import { GetBudgetCategoriesPaginationService } from '../services/getBudgetCategoriesPagination.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteBudgetCategoriesService = new DeleteBudgetCategoriesService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'BudgetCategories',
  components: {
    AppConfirmDeleteModal,
    BudgetCategoriesForm,
    AppDatatableColumn,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppButton,
    AppModal,
  },

  setup() {
    const { t } = useI18n();
    const name = 'BudgetCategories';
    const title = 'Conceptos de presupuesto';
    const serviceDatatable = new GetBudgetCategoriesPaginationService();

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Presupuestos', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const currentBudgetCategorie: Ref<any> = ref(null);

    const currentBudgetCategorieId = ref();

    const budgetCategorieModal = ref(false);
    const modalDelete = ref(false);

    const openBudgetCategoriesForm = async (budgetCategorie: any | null = null) => {
      currentBudgetCategorie.value = budgetCategorie;
      budgetCategorieModal.value = true;
    };
    const closeBudgetCategoriesForm = async () => {
      budgetCategorieModal.value = false;
      currentBudgetCategorie.value = null;

      updateDatatableService.run();
    };

    const openConfirmDelete = (id: number) => {
      currentBudgetCategorieId.value = id;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentBudgetCategorieId.value) {
          await deleteBudgetCategoriesService.run(currentBudgetCategorieId.value);

          currentBudgetCategorieId.value = null;

          updateDatatableService.run();
        }
      } catch (e) {
        console.log(e);
      }

      modalDelete.value = false;
    };

    return {
      routes,
      title,
      t,

      currentBudgetCategorie,
      budgetCategorieModal,
      serviceDatatable,
      modalDelete,
      name,

      closeBudgetCategoriesForm,
      openBudgetCategoriesForm,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped></style>
