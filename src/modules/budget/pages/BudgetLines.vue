<template>
  <AppBaseList :title="title">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <div v-if="!budgetLines.length">
          <AppButtonNewContainer @click="openBudgetLineForm(null)"></AppButtonNewContainer>

          <AppEmptyResponse :show-image="true"></AppEmptyResponse>
        </div>

        <div v-else class="grid-cards">
          <AppButtonNewContainer @click="openBudgetLineForm(null)"></AppButtonNewContainer>

          <AppCard v-for="(item, index) in budgetLines" :key="index">
            <template #title>
              <div>{{ item.name }}</div>
            </template>

            <template #body>
              <p class="mb-0" v-html="linkifyHtml(item.description ?? 'Aun no se ha agregado una descripción', { target: '_blank' })"></p>
            </template>

            <template #footer>
              <div class="d-flex justify-content-end">
                <AppButtonGroup>
                  <AppButtonEdit @click="openBudgetLineForm(item)"></AppButtonEdit>

                  <AppButtonDelete @click="openConfirmDelete(item.id)"></AppButtonDelete>
                </AppButtonGroup>
              </div>
            </template>
          </AppCard>
        </div>
      </template>

      <AppModal v-model="budgetLineModal" :size="'lg'">
        <BudgetLinesForm v-if="budgetLineModal" :data="currentBudgetLine" @close="closeBudgetLineForm"></BudgetLinesForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Rubro" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import linkifyHtml from 'linkify-html';
import * as linkify from 'linkifyjs';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import BudgetLinesForm from '../components/BudgetLinesForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import { GetBudgetLinesService } from '../services/getBudgetLines.service';
import { DeleteBudgetLinesService } from '../services/deleteBudgetLines.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteBudgetLinesService = new DeleteBudgetLinesService();
const getBudgetLinesService = new GetBudgetLinesService();

export default defineComponent({
  name: 'BudgetLines',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    AppEmptyResponse,
    AppButtonDelete,
    BudgetLinesForm,
    AppButtonGroup,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Rubros presupuestales';

    const currentBudgetLine: Ref<any> = ref(null);
    const budgetLines: Ref<any[]> = ref([]);

    const currentBudgetLineId = ref();

    const budgetLineModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Presupuestos', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
        await getBudgetLines();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getBudgetLines = async () => {
      loading.value = true;

      budgetLines.value = await getBudgetLinesService.run();

      loading.value = false;
    };

    const openBudgetLineForm = async (budgetLine: any | null = null) => {
      currentBudgetLine.value = budgetLine;
      budgetLineModal.value = true;
    };
    const closeBudgetLineForm = async () => {
      budgetLineModal.value = false;
      currentBudgetLine.value = null;

      await getBudgetLines();
    };

    const openConfirmDelete = (budgetLineId: number) => {
      currentBudgetLineId.value = budgetLineId;

      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentBudgetLineId.value) {
          await deleteBudgetLinesService.run(currentBudgetLineId.value);

          currentBudgetLineId.value = null;

          await getBudgetLines();
        }
      } catch (e) {
        console.log(e);
      }

      modalDelete.value = false;
    };

    return {
      loading,
      routes,
      title,
      t,

      currentBudgetLine,
      budgetLineModal,
      budgetLines,
      modalDelete,

      closeBudgetLineForm,
      openBudgetLineForm,
      openConfirmDelete,
      confirmDelete,

      linkifyHtml,
      linkify,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}
</style>
