<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="grid-cards">
          <AppCard v-for="financingSystem in financingSystems.value" :key="financingSystem.id">
            <!-- nombre de la card principal -->
            <template #title>
              <div class="title-card">{{ financingSystem.name }}</div>
            </template>
            <template #body>
              <div class="content-card">{{ financingSystem.description }}</div>
            </template>
            <template #footer>
              <div class="buttons-card">
                <div>
                  <!-- <AppButtonEdit @click="openBudgetPlanningPeriodsModal(financingSystem.id)"></AppButtonEdit> -->
                  <AppButton icon="plus" v-tooltip="'core.new'" @click="openBudgetExecutionModal(financingSystem)"></AppButton>
                </div>
                <div class="button-left">
                  <AppButton icon="eye" v-tooltip="'core.view'" @click="redirectView(financingSystem.id)"></AppButton>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
      </template>
      <AppModal v-model="budgetExecutionModal" :size="'xl'">
        <BudgetExecutionForm v-if="budgetExecutionModal" :data="currentBudgetExecution" @close="closeBudgetExecutionModal"></BudgetExecutionForm>
      </AppModal>
      
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
//import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import { useHeaderStore } from '../../../stores/header.store';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import BudgetExecutionForm from '../components/BudgetExecutionForm.vue';

import { GetFinancingClassificationSystemService } from '../services/getFinancingClassificationSystems.service';
//import { GetBudgetPlanningService } from '../services/getBudgetPlanning.service';
//import { GetBudgetPlanningService } from '../services/getBudgetPlanning.service';

const getFinancingClassificationSystemService = new GetFinancingClassificationSystemService();
//const getBudgetPlanningService = new GetBudgetPlanningService();
export default defineComponent({
  components: {
    AppButton,
    AppLoading,
    AppBaseList,
    //AppButtonEdit,
    AppCard,
    AppModal,
    BudgetExecutionForm,
  },
  name: 'incomeExecutionPage',
  setup() {
    const title = 'Ejecución de ingresos';
    const routes = [
      {
        name: title,
      },
    ];
    useMeta({
      title,
    });
    const router = useRouter();
    const loading = ref(true);
    const financingSystems: { value: any } = reactive({ value: [] });
    const budgetExecutionModal = ref(false);
    const currentBudgetExecution = ref<any>(null);
    const budgetPlanningPeriodsModal = ref(false);
    const currentPlanningPeriods = ref<any>(null);

    //const modalDelete = ref(false);

    const openBudgetExecutionModal = async (financingSystem: any) => {
      currentBudgetExecution.value = financingSystem;
      budgetExecutionModal.value = true;
      console.log(financingSystem);
    };
    const closeBudgetExecutionModal = async () => {
      budgetExecutionModal.value = false;
      openBudgetPlanningPeriodsModal(currentBudgetExecution.value.id);
      currentBudgetExecution.value = null;

      //updateDatatableService.run();
    };
    const openBudgetPlanningPeriodsModal = async (financingSystemId: any) => {
      currentPlanningPeriods.value = financingSystemId;
      budgetPlanningPeriodsModal.value = true;
    };
    const closeBudgetPlanningPeriodsModal = async () => {
      budgetPlanningPeriodsModal.value = false;
      currentPlanningPeriods.value = null;
    };
    onMounted(async () => {
      await getData();
      loading.value = false;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Presupuesto', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });
    const getData = async () => {
      try {
        financingSystems.value = await getFinancingClassificationSystemService.run();
      } catch (e) {
        console.log('error', e);
      }
    };
    const redirectView = async (systemId: number) => {
      await router.push({
        name: 'budget.incomeExecutionDetails',
        params: {
          accountingSystemId: systemId,
        },
      });
    };
    return {
      title,
      routes,
      loading,
      financingSystems,
      redirectView,

      openBudgetExecutionModal,
      closeBudgetExecutionModal,
      budgetExecutionModal,
      currentBudgetExecution,

      budgetPlanningPeriodsModal,
      openBudgetPlanningPeriodsModal,
      closeBudgetPlanningPeriodsModal,
      currentPlanningPeriods,
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
.container-items {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 320px;
  min-width: 287px;
}
.container-new {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.buttons-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.button-righ {
  display: flex;
  justify-content: space-between;
}
.button-left {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.content-card {
  width: 100%;
  word-wrap: break-word;
}
</style>
