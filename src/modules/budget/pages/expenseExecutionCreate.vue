<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButtonBack :to="{ name: 'budget.expenseExecution' }" />
      <AppButton label="core.save" style="color: white" @click="save"></AppButton>
    </template>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <AppFormField :form-control="v$.form.name" label="Nombre de la ejecución de gastos">
          <input id="name" type="text" class="form-control" v-model="v$.form.name.$model" />
        </AppFormField>
        <AppCard>
          <template #body>
            <table class="table">
              <thead>
                <tr>
                  <!-- Encabezados de las columnas fijas -->
                  <th>Código Fuente</th>
                  <th>Detalle</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(row, rowIndex) in dataBudgetPlanning" :key="rowIndex">
                  <tr v-show="row.editValue">
                    <!-- Datos de las columnas fijas -->
                    <td>
                      {{ row.financing_sources?.code || row.type_financing_sources?.code }}
                    </td>
                    <td>
                      {{ row.financing_sources?.name || row.type_financing_sources?.name }}
                    </td>
                    <td>
                      <div class="d-flex">
                        <AppButton icon="plus" v-tooltip="'Relacionar Rubros'" @click="openBudgetExecutionModal(financingSystemId, row.id)"></AppButton>
                        <AppButton :icon="expandedRows[row.id] ? 'chevron-up' : 'chevron-down'" @click="toggleRow(row.id)"></AppButton>
                      </div>
                    </td>
                  </tr>
                  <!-- Fila desplegable -->
                  <tr v-if="expandedRows[row.id]" class="row-details">
                    <td colspan="3">
                      <div class="sub-title">Rubros relacionados</div>
                      <div class="content-subtable">
                        <table class="table sub-table">
                          <thead>
                            <tr>
                              <th>Código Rubro</th>
                              <th>Detalle</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="item in getRelatedItems(row.id)" :key="item.id">
                              <td>
                                {{ item.data?.code || item.financing_sources.code || item.type_financing_sources.code }}
                              </td>
                              <td>
                                {{ item.data?.name || item.financing_sources.name || item.type_financing_sources.name }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </template>
        </AppCard>
      </template>
      <AppModal v-model="budgetExecutionModal" :size="'xl'">
        <BudgetExpenseExecutionForm v-if="budgetExecutionModal" :data="currentBudgetExecution" @close="closeBudgetExecutionModal"></BudgetExpenseExecutionForm>
      </AppModal>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
//import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import BudgetExpenseExecutionForm from '../components/BudgetExpenseExecutionForm.vue';
import { ToastService } from '../../../shared/services/toast.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GetBudgetPlanningService } from '../services/getBudgetPlanning.service';
import { GetAllParentsTypesFinancingService } from '../services/getAllParentsTypesFinancing.service';
import { CreateOrUpdateBudgetExpenseExecutionService } from '../services/createOrUpdateBudgetExpenseExecution.service';
import { GetBudgetExpenseExecutionService } from '../services/getBudgetExpenseExecution.service';
import { UpdateBudgetExpenseExecutionAddExpensesService } from '../services/updateBudgetExpenseExecutionAddExpenses.service';
import { AnyARecord } from 'dns';

const getBudgetPlanningService = new GetBudgetPlanningService();
const getAllParentsTypesFinancingService = new GetAllParentsTypesFinancingService();
const createOrUpdateBudgetExpenseExecutionService = new CreateOrUpdateBudgetExpenseExecutionService();
const getBudgetExpenseExecutionService = new GetBudgetExpenseExecutionService();
const updateBudgetExpenseExecutionAddExpensesService = new UpdateBudgetExpenseExecutionAddExpensesService();
const toastService = new ToastService();
export default defineComponent({
  components: {
    AppButton,
    AppLoading,
    AppBaseList,
    AppFormField,
    //AppButtonEdit,
    AppCard,
    AppButtonBack,
    AppModal,
    BudgetExpenseExecutionForm,
  },
  name: 'expenseExecutionCreatePage',
  setup() {
    const title = 'Crear ejecución de gastos';
    useMeta({
      title,
    });
    const loading = ref(true);
    const route = useRoute();
    const router = useRouter();
    const financingSystemId = parseInt(route.params.accountingSystemId as string);
    const dataBudgetPlanning = ref<any>([]);

    const budgetExecutionModal = ref(false);
    const currentBudgetExecution = ref<any>(null);
    const currentIncomeId = ref<any>(null);
    const typeExpenseSource = ref<any>(null);
    const typeRubroExpenseSource = ref<any>(null);
    const incomeExpenses = ref<any[]>([]);
    const incomeExpensesCreate = ref<any[]>([]);
    const expandedRows = ref<Record<number, boolean>>({});
    const existingBudget = ref(false);
    //const budgetPlanningPeriodsModal = ref(false);
    //const currentPlanningPeriods = ref<any>(null);

    //const modalDelete = ref(false);

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
        const res = await getAllParentsTypesFinancingService.run(financingSystemId);
        typeExpenseSource.value = res.find((item: any) => item.reference === 'FUENTES_FINANCIACION');
        typeRubroExpenseSource.value = res.find((item: any) => item.reference === 'RUBROS');
        const params = {
          standardizedAccountingSystemId: financingSystemId,
          typeFinancingSourceId: typeExpenseSource.value?.id,
        };
        dataBudgetPlanning.value = await getBudgetPlanningService.run(params);
        await getDataExecution();
      } catch (e) {
        console.log('error', e);
      }
    };
    const getDataExecution = async () => {
      try {
        const p = {
          standardizedAccountingSystemId: financingSystemId,
          typeFinancingSourceId: typeRubroExpenseSource.value?.id,
        };
        const respo = await getBudgetExpenseExecutionService.run(p);
        if (respo?.length) {
          incomeExpenses.value = normalizeBackendData(respo); //Normalizar la data
          form.name = respo?.[0]?.executionOfExpense?.[0]?.execution_of_expenses?.name; // Nombre
          form.id = respo?.[0]?.executionOfExpense?.[0]?.execution_of_expenses?.id ?? null;
          existingBudget.value = true; // Variable para validaciones
        }
        console.log('existingBudget', existingBudget.value);
        console.log('resó', respo);
      } catch (e) {
        console.error(e);
      }
    };

    const normalizeBackendData = (respo: any) => {
      return (
        respo?.[0]?.incomeExpenses.map((expense: any) => ({
          budgetPlanningIncomeId: expense.budgetPlanningIncomeId,
          budgetPlanningBillsId: expense.budgetPlanningBills || [], // Siempre inicializa esta propiedad
          typeFinancingSourceId: typeRubroExpenseSource.value?.id,
        })) || []
      );
    };
    // Alternar el estado de una fila específica
    const toggleRow = (id: number) => {
      expandedRows.value[id] = !expandedRows.value[id];
    };
    // Obtener los ítems relacionados para una fila dada
    const getRelatedItems = (id: number) => {
      const related = incomeExpenses.value.find((expense) => expense.budgetPlanningIncomeId === id) || incomeExpensesCreate.value.find((expense) => expense.budgetPlanningIncomeId === id);

      return related ? related.budgetPlanningBillsId : [];
    };
    const form: any = reactive({
      name: null,
      id: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          id: {},
        },
      },
      { form }
    );

    const openBudgetExecutionModal = async (financingSystem: any, incomeId: number) => {
      currentBudgetExecution.value = financingSystem;
      currentIncomeId.value = incomeId;
      budgetExecutionModal.value = true;
      console.log(financingSystem);
    };
    const closeBudgetExecutionModal = async (selectedItems: any[]) => {
      //manejar array de rubros
      if (selectedItems.length) {
        //const selectedIds = selectedItems.map(item => item.data.id);

        // Busca si ya existe un registro con el mismo budgetPlanningIncomeId
        console.log('incomeExpenses', incomeExpenses);
        const existingIndex = incomeExpenses.value.findIndex((expense) => expense.budgetPlanningIncomeId === currentIncomeId.value);
        const existingIndexCreate = incomeExpensesCreate.value.findIndex((expense) => expense.budgetPlanningIncomeId === currentIncomeId.value);
        //si existe un registro y ya existe una ejecucion agregamos
        console.log('existingIndex', existingIndex, 'existingIndexCreate', existingIndexCreate);
        if (existingIndex !== -1) {
          //actualizamos expense (update)
          const existingBills = incomeExpenses.value[existingIndex].budgetPlanningBillsId || [];
          // Separar los elementos del backend(sin entity) en Child y Parent
          console.log('existe actualizar');
          const [backendBills, backendBillsParent] = existingBills.reduce(
            (acc: any[], bill: any) => {
              if (!bill.entity && bill.financing_sources?.id) {
                acc[0].push(bill); // Child
              } else if (!bill.entity && !bill.financing_sources?.id) {
                acc[1].push(bill); // Parent
              }
              return acc;
            },
            [[], []]
          );

          // Separar los elementos seleccionados en Child y Parent
          const [items, itemsParent] = selectedItems.reduce(
            (acc: any[], item: any) => {
              acc[item.entity === 'Child' ? 0 : 1].push(item);
              return acc;
            },
            [[], []]
          );
          // Filtrar los nuevos items evitando duplicados en cada categoría
          const newItems = items.filter(
            (item: any) => !backendBills.some((bill: any) => bill.financing_sources?.id === item.data?.id) // || !bill.financing_sources.id
          );
          const newItemsParent = itemsParent.filter((item: any) => !backendBillsParent.some((bill: any) => bill.type_financing_sources?.id === item.data?.id));
          // Unimos ambos arrays
          const allNewItems = [...newItems, ...newItemsParent];
          const allBackendBills = [...backendBills, ...backendBillsParent];
          //          console.log('newItems',newItems, newItemsParent)
          incomeExpenses.value[existingIndex] = {
            ...incomeExpenses.value[existingIndex],
            budgetPlanningBillsId: [...allBackendBills, ...allNewItems],
            typeFinancingSourceId: typeRubroExpenseSource.value?.id,
          };
        } else if (existingIndexCreate !== -1) {
          //actualizamos expense local, (create)
          // Actualiza el registro existente
          incomeExpensesCreate.value[existingIndexCreate] = {
            ...incomeExpensesCreate.value[existingIndexCreate],
            budgetPlanningBillsId: selectedItems,
            typeFinancingSourceId: typeRubroExpenseSource.value?.id,
          };
        } else {
          // gregar nuevo (create)
          console.log('creando nuevo creando...');
          incomeExpensesCreate.value.push({
            budgetPlanningIncomeId: currentIncomeId.value,
            budgetPlanningBillsId: selectedItems,
            typeFinancingSourceId: typeRubroExpenseSource.value?.id,
          });
        }
      }

      console.log('update incomeExpenses', incomeExpenses.value, 'incomeExpensesCreate', incomeExpensesCreate.value);
      budgetExecutionModal.value = false;
      currentBudgetExecution.value = null;
      currentIncomeId.value = null;
      //updateDatatableService.run();
    };
    const redirecExpenseView = async () => {
      await router.push({
        name: 'budget.expenseExecutionDetails',
        params: {
          financingSystemId: financingSystemId,
        },
      });
    };

    const showWarningToast = (message: string) => {
      toastService.hide();
      toastService.show(message, 'warning');
    };

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        const incomeExpensesIds = incomeExpenses.value
          .map((expense) => ({
            budgetPlanningIncomeId: expense.budgetPlanningIncomeId,
            budgetPlanningBillsId: expense.budgetPlanningBillsId.filter((item: any) => item.entity === 'Child').map((bill: any) => bill.data.id), // Solo IDs
            typeFinancingSourceId: expense.typeFinancingSourceId,
          }))
          .filter((expense) => expense.budgetPlanningBillsId.length > 0); // Filtra los que tengan budgetPlanningBillsId vacío
        const incomeExpensesCreateIds = incomeExpensesCreate.value
          .map((expense) => ({
            budgetPlanningIncomeId: expense.budgetPlanningIncomeId,
            budgetPlanningBillsId: expense.budgetPlanningBillsId.filter((item: any) => item.entity === 'Child').map((bill: any) => bill.data.id), // Solo IDs
            typeFinancingSourceId: expense.typeFinancingSourceId,
          }))
          .filter((expense) => expense.budgetPlanningBillsId.length > 0); // Filtra los que tengan budgetPlanningBillsId vacío

        if (incomeExpensesIds.length <= 0 && incomeExpensesCreateIds.length <= 0) {
          showWarningToast('Debes agregar al menos una relación antes de continuar.');
          return;
        }

        const executionPayloadUpdate = {
          incomeExpenses: incomeExpensesIds,
          executionOfExpenses: {
            name: form.name,
            standardizedAccountingSystemId: financingSystemId,
            id: form.id,
          },
        };
        const executionPayloadCreate = {
          incomeExpenses: incomeExpensesCreateIds,
          executionOfExpenses: {
            name: form.name,
            standardizedAccountingSystemId: financingSystemId,
            id: form.id,
          },
        };

        if (incomeExpensesIds.length) {
          console.log('update', 'executionPayloadUpdate', executionPayloadUpdate);
          await updateBudgetExpenseExecutionAddExpensesService.run(executionPayloadUpdate);
        }
        if (incomeExpensesCreateIds.length) {
          console.log('crear', 'executionPayloadCreate', executionPayloadCreate);
          await createOrUpdateBudgetExpenseExecutionService.run(executionPayloadCreate);
        }
        redirecExpenseView();
      } catch (e) {
        console.error(e);
      }
    };

    return {
      title,
      loading,
      v$,
      save,
      financingSystemId,
      dataBudgetPlanning,
      budgetExecutionModal,
      currentBudgetExecution,
      openBudgetExecutionModal,
      closeBudgetExecutionModal,
      expandedRows,
      toggleRow,
      getRelatedItems,
      existingBudget,
    };
  },
});
</script>

<style scoped>
/*:deep(table) {
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
  background-color: white;
  padding: 8px 24px;
}
*/
.table {
  border-radius: 14px;
  font-family: 'Arial', sans-serif;
  background-color: white;
}
.table thead th {
  color: #363636;
}
/* Hover en filas */
.table tbody tr:hover {
  background-color: #fafafa;
}
.table > :not(:first-child) {
  border-top: 2px solid #dbdbdb;
}
.content-subtable {
  padding-left: 15px;
}
.sub-title {
  font-weight: bold;
  margin: 10px 0px;
}
</style>
