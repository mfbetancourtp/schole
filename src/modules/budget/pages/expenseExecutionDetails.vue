<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'budget.expenseExecution' }" />
    </template>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <!--   <AppCard>
          <template #body> -->
        <!-- Filtro de selección de períodos -->
        <div class="filter mb-3">
          <div>
            <AppDropdown>
              <template v-slot:button>
                <AppButton icon="filter"> </AppButton>
              </template>

              <template v-slot:items>
                <li class="mx-2">
                  <div v-for="period in periodOptions" :key="period" class="form-check">
                    <input type="checkbox" :id="`period-${period.numberPeriod}`" :value="period.numberPeriod" v-model="selectedPeriods" class="form-check-input" />
                    <label :for="`period-${period}`" class="form-check-label">
                      {{ period.namePeriod }}
                    </label>
                  </div>
                </li>
              </template>
            </AppDropdown>
          </div>
          <div class="slider">
            <AppButton v-for="(option, index) in sizeOptions" :key="index" :class="{ active: currentSize === option }" @click="changeTableSize(option)">
              {{ option }}
            </AppButton>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered" :class="`size-${currentSize.toLowerCase()}`">
            <thead>
              <tr>
                <th class="sticky-column bg-white static-colum"></th>
                <th class="sticky-column bg-white static-colum s-colum-1"></th>
                <th class="sticky-column bg-white static-colum s-colum-2"></th>
                <template v-for="(period, index) in filteredPeriods" :key="'period-' + index">
                  <th :colspan="(period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted?.length * 2 || 0) + 9"></th>
                  <th colspan="2" style="background-color: #ffff00">
                    {{ period.namePeriod }}
                  </th>
                </template>
              </tr>
              <tr>
                <!-- Encabezados de las columnas fijas -->
                <th class="sticky-column bg-white static-colum">CODIGO</th>
                <th class="sticky-column bg-white static-colum s-colum-1">Detalle</th>
                <th class="sticky-column bg-white static-colum s-colum-2" style="background-color: #ffd966 !important">Presupuesto Inicial</th>
                <!-- Encabezados dinámicos -->
                <template v-for="(period, index) in filteredPeriods" :key="index">
                  <th>Adición</th>
                  <th>Total Adición</th>
                  <th>Crédito</th>
                  <th>Total Crédito</th>
                  <th>Contra Crédito</th>
                  <th>Total Contra Crédito</th>
                  <th>Reducción</th>
                  <th>Total Reducción</th>
                  <th style="background-color: #99ff33">Ppto Final Aprobado</th>
                  <template v-for="(mes, index) in period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted" :key="index">
                    <th style="background-color: #c4d9eb">Comprometido-{{ mes.nameMonth || mes.month }}</th>
                    <th style="background-color: #c4d9eb">Ejecutado-{{ mes.nameMonth || mes.month }}</th>
                  </template>

                  <th style="background-color: #ffff00">Ppto Ejecutado</th>
                  <th style="background-color: #ffff00">Ppto Por Ejecutar</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <template v-for="(item, index) in dataBudgetPlanning" :key="item.uniqueId || index">
                <!-- Execution of Expense -->
                <tr v-if="item.executionOfExpense?.length" class="colum-execution">
                  <td class="sticky-column static-colum colum-execution text-center">--</td>
                  <td class="sticky-column static-colum s-colum-1 colum-execution text-center">
                    {{ item.executionOfExpense?.[0]?.execution_of_expenses?.name }}
                  </td>
                  <td class="sticky-column static-colum s-colum-2 colum-execution text-center">
                    {{ n(item.executionOfExpense?.[0]?.initialBudget || 0) }}
                  </td>
                  <template v-for="(period, index) in item.executionOfExpense?.[0]?.budgetPlanningPeriods" :key="index">
                    <template v-if="selectedPeriods.includes(period.numberPeriod)">
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods[0].additional || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods[0].totalAdditional || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods[0].credit || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods[0].totalCredit || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods[0].againstCredit || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods[0].totalAgainstCredit || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods[0].reduction || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods[0].totalReduction || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods?.[0]?.budgetFinalApproved || 0) }}
                      </td>
                      <template v-for="(mes, index) in period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted" :key="index">
                        <td class="text-center">
                          {{ n(mes.commitedAmount || 0) }}
                        </td>
                        <td class="text-center">
                          {{ n(mes.executedAmount || 0) }}
                        </td>
                      </template>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods?.[0]?.budgetExecuted || 0) }}
                      </td>
                      <td class="text-center">
                        {{ n(period.financingSourcesPeriods?.[0]?.budgetToExecuted || 0) }}
                      </td>
                    </template>
                  </template>
                </tr>

                <!-- Income Expenses -->
                <template v-for="(incomeExpense, ieIndex) in item.incomeExpenses" :key="incomeExpense.id || ieIndex">
                  <template v-for="(budgetPlanningIncome, ieIndex) in incomeExpense.budgetPlanningIncome" :key="budgetPlanningIncome.id || ieIndex">
                    <tr v-if="incomeExpense.budgetPlanningIncome?.length" class="colum-income">
                      <td class="sticky-column static-colum colum-income text-center">
                        {{ budgetPlanningIncome.financing_sources?.code || budgetPlanningIncome.type_financing_sources?.code }}
                      </td>
                      <td class="sticky-column static-colum s-colum-1 colum-income text-center">
                        {{ budgetPlanningIncome.financing_sources?.name }} -
                        {{ budgetPlanningIncome.type_financing_sources?.name }}
                      </td>
                      <td class="sticky-column static-colum s-colum-2 colum-income text-center">
                        {{ n(budgetPlanningIncome.initialBudget || 0) }}
                      </td>
                      <template v-for="(period, index) in budgetPlanningIncome.budgetPlanningPeriods" :key="index">
                        <template v-if="selectedPeriods.includes(period.numberPeriod)">
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].additional || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalAdditional || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].credit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalCredit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].againstCredit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalAgainstCredit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].reduction || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalReduction || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetFinalApproved || 0) }}
                          </td>
                          <template v-for="(mes, index) in period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted" :key="index">
                            <td class="text-center">
                              {{ n(mes.commitedAmount || 0) }}
                            </td>
                            <td class="text-center">
                              {{ n(mes.executedAmount || 0) }}
                            </td>
                          </template>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetExecuted || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetToExecuted || 0) }}
                          </td>
                        </template>
                      </template>
                    </tr>
                  </template>
                  <!-- Budget Planning Income Bills -->
                  <template v-for="incomeBills in incomeExpense.budgetPlanningIncomeBills" :key="incomeBills.id">
                    <tr v-if="incomeExpense.budgetPlanningIncomeBills?.length" class="colum-income-bill">
                      <td class="sticky-column static-colum colum-income-bill text-center">
                        {{ incomeBills.financing_sources?.code || incomeBills.type_financing_sources?.code }}
                      </td>
                      <td class="sticky-column static-colum s-colum-1 colum-income-bill text-center">
                        <div class="content-edit">
                          <div>
                            {{ incomeBills.financing_sources?.name }} -
                            {{ incomeBills.type_financing_sources?.name }}
                          </div>
                          <div class="btn-edit">
                            <AppButton icon="credit-card" @click="openAssociateAccountsFormModal(incomeBills)"></AppButton>
                          </div>
                        </div>
                      </td>
                      <td class="sticky-column static-colum s-colum-2 colum-income-bill text-center">
                        <div class="content-edit">
                          {{ n(incomeBills.initialBudget || 0) }}
                        </div>
                      </td>
                      <template v-for="(period, index) in incomeBills.budgetPlanningPeriods" :key="index">
                        <template v-if="selectedPeriods.includes(period.numberPeriod)">
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].additional || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalAdditional || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].credit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalCredit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].againstCredit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalAgainstCredit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].reduction || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalReduction || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetFinalApproved || 0) }}
                          </td>
                          <template v-for="(mes, index) in period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted" :key="index">
                            <td class="text-center">
                              {{ n(mes.commitedAmount || 0) }}
                            </td>
                            <td class="text-center">
                              {{ n(mes.executedAmount || 0) }}
                            </td>
                          </template>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetExecuted || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetToExecuted || 0) }}
                          </td>
                        </template>
                      </template>
                    </tr>
                  </template>
                  <!-- Budget Planning Bills -->
                  <template v-for="bill in incomeExpense.budgetPlanningBills" :key="bill.id">
                    <tr v-if="incomeExpense.budgetPlanningBills?.length">
                      <td class="sticky-column bg-white static-colum text-center">
                        {{ bill.financing_sources?.code || bill.type_financing_sources?.code }}
                      </td>
                      <td class="sticky-column bg-white static-colum s-colum-1 text-center">
                        {{ bill.financing_sources?.name || bill.type_financing_sources?.name }}
                      </td>
                      <td class="sticky-column bg-white static-colum s-colum-2 text-center">
                        <div class="content-edit">
                          <div class="content-value">
                            {{ n(bill.initialBudget || 0) }}
                          </div>
                          <div class="btn-edit">
                            <AppButtonEdit v-if="bill.editValue" @click="openInitialBudgetForm(bill, incomeExpense, item.executionOfExpense)"></AppButtonEdit>
                            <!--item/dataBudgetPlanning-->
                          </div>
                        </div>
                      </td>
                      <template v-for="(period, index) in bill.budgetPlanningPeriods" :key="index">
                        <template v-if="selectedPeriods.includes(period.numberPeriod)">
                          <td>
                            <div class="content-edit">
                              <div class="content-value">
                                {{ n(period.financingSourcesPeriods[0].additional || 0) }}
                              </div>
                              <div class="btn-edit">
                                <AppButtonEdit v-if="bill.editValue" @click="openAdditionalOrReductionForm(period, bill, incomeExpense, item.executionOfExpense, 'additional')"> </AppButtonEdit>
                              </div>
                            </div>
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalAdditional || 0) }}
                          </td>
                          <td>
                            <div class="content-edit">
                              <div class="content-value">
                                {{ n(period.financingSourcesPeriods[0].credit || 0) }}
                              </div>
                              <div class="btn-edit">
                                <AppButtonEdit v-if="bill.editValue" @click="openAdditionalOrReductionForm(period, bill, incomeExpense, item.executionOfExpense, 'credit')"> </AppButtonEdit>
                              </div>
                            </div>
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalCredit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].againstCredit || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalAgainstCredit || 0) }}
                          </td>
                          <td>
                            <div class="content-edit">
                              <div class="content-value">
                                {{ n(period.financingSourcesPeriods[0].reduction || 0) }}
                              </div>
                              <div class="btn-edit">
                                <AppButtonEdit v-if="bill.editValue" @click="openAdditionalOrReductionForm(period, bill, incomeExpense, item.executionOfExpense, 'reduction')"> </AppButtonEdit>
                              </div>
                            </div>
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods[0].totalReduction || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetFinalApproved || 0) }}
                          </td>
                          <template v-for="(mes, index) in period.financingSourcesPeriods?.[0]?.budgetPlanningExecuted" :key="index">
                            <td>
                              <div class="content-edit">
                                <div class="content-value">
                                  {{ n(mes.commitedAmount || 0) }}
                                </div>
                                <div class="btn-edit">
                                  <AppButtonEdit
                                    v-if="bill.editValue && incomeExpense.budgetPlanningIncomeBills?.[0]?.bankId"
                                    @click="openCommitedAmountExpenseForm(mes, period, bill, incomeExpense, item.executionOfExpense, 'commitedAmount')"
                                  ></AppButtonEdit>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div class="content-edit">
                                <div class="content-value">
                                  {{ n(mes.executedAmount || 0) }}
                                </div>
                                <div class="btn-edit">
                                  <AppButtonEdit
                                    v-if="bill.editValue && incomeExpense.budgetPlanningIncomeBills?.[0]?.bankId && mes.commitedAmount > 0"
                                    @click="openAmountMonthForm(mes, period, bill, incomeExpense, item.executionOfExpense, 'executedAmount')"
                                  ></AppButtonEdit>
                                </div>
                              </div>
                            </td>
                          </template>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetExecuted || 0) }}
                          </td>
                          <td class="text-center">
                            {{ n(period.financingSourcesPeriods?.[0]?.budgetToExecuted || 0) }}
                          </td>
                        </template>
                      </template>
                    </tr>
                  </template>
                </template>
              </template>
            </tbody>
          </table>
        </div>
        <!--   </template>
      </AppCard>-->
      </template>
      <AppModal v-model="initialBudgetModal" :size="'lg'">
        <InitialBudgetExpenseExecutionForm
          v-if="initialBudgetModal"
          :data="currentInitialBudget"
          :dataIncomeExpense="currentInitialBudgetIncomeExpense"
          :dataExecutionOfExpense="currentInitialBudgetExecutionOfExpense"
          @close="closeInitialBudgetForm"
        ></InitialBudgetExpenseExecutionForm>
      </AppModal>
      <AppModal v-model="additionalOrReductionModal" :size="'lg'">
        <AdditionalOrReductionExpenseExecutionForm
          v-if="additionalOrReductionModal"
          :data="currentAdditionalOrReduction"
          :detailData="currentDetailAddOrRed"
          :dataIncomeExpense="currentAdditionalOrReductionIncomeExpense"
          :dataExecutionOfExpense="currentAdditionalOrReductionDataExecutionOfExpense"
          :entity="entityAdditionalOrReduction"
          @close="closeAdditionalOrReductionForm"
        >
        </AdditionalOrReductionExpenseExecutionForm>
      </AppModal>
      <AppModal v-model="commitedAmountExpenseFormModal" :size="'lg'">
        <CommitedAmountExpenseForm
          v-if="commitedAmountExpenseFormModal"
          :data="currentCommitedAmountExpenseForm"
          :detailData="currentDetailAmountMonthCommitedExpense"
          :dataIncomeExpense="currentDetailAmountMonthCommitedExpenseIncomeExpense"
          :detailPeriod="currentDetailtPeriodCommitedAmountExpense"
          :dataExecutionOfExpense="currentAmountMonthExecutionOfExpenseCommited"
          :entity="entityAmountMonth"
          @close="closeCommitedAmountExpenseForm"
        >
        </CommitedAmountExpenseForm>
      </AppModal>
      <AppModal v-model="amountMonthFormModal" :size="'lg'">
        <ExecutedAmountExpenseForm
          v-if="amountMonthFormModal"
          :data="currentAmountMonthForm"
          :detailData="currentDetailAmountMonth"
          :dataIncomeExpense="currentDetailAmountMonthIncomeExpense"
          :detailPeriod="currentDetailPeriod"
          :dataExecutionOfExpense="currentAmountMonthExecutionOfExpense"
          :entity="entityAmountMonth"
          @close="closeAmountMonthForm"
        >
        </ExecutedAmountExpenseForm>
      </AppModal>

      <AppModal v-model="associateAccountsFormModal" :size="'lg'">
        <AssociateAccountsForm v-if="associateAccountsFormModal" :incomeBill="currentDataIncomeBill" :financingSystemId="financingSystemId" @close="closeAssociateAccountsFormModal">
        </AssociateAccountsForm>
      </AppModal>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import { useHeaderStore } from '../../../stores/header.store';
import AppDropdown from '../../../shared/components/AppDropdown.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import InitialBudgetExpenseExecutionForm from '../components/InitialBudgetExpenseExecutionForm.vue';
import AdditionalOrReductionExpenseExecutionForm from '../components/AdditionalOrReductionExpenseExecutionForm.vue';
import CommitedAmountExpenseForm from '../components/CommitedAmountExpenseForm.vue';
import AssociateAccountsForm from '../components/AssociateAccountsForm.vue';
import { GetBudgetExpenseExecutionService } from '../services/getBudgetExpenseExecution.service';
import { GetAllParentsTypesFinancingService } from '../services/getAllParentsTypesFinancing.service';
import ExecutedAmountExpenseForm from '../components/ExecutedAmountExpenseForm.vue';

const getBudgetExpenseExecutionService = new GetBudgetExpenseExecutionService();
const getAllParentsTypesFinancingService = new GetAllParentsTypesFinancingService();
export default defineComponent({
  components: {
    AppButton,
    AppLoading,
    AppBaseList,
    AppButtonBack,
    AppButtonEdit,
    AppModal,
    AppDropdown,
    InitialBudgetExpenseExecutionForm,
    AdditionalOrReductionExpenseExecutionForm,
    CommitedAmountExpenseForm,
    AssociateAccountsForm,
    ExecutedAmountExpenseForm,
  },
  name: 'expenseExecutionDetailsPage',
  setup() {
    const { n } = useI18n();
    const title = 'Ejecución de gastos';
    const routes = [
      {
        name: title,
      },
    ];
    useMeta({
      title,
    });
    const route = useRoute();
    const loading = ref(true);
    const dataBudgetPlanning = ref<any>([]);
    const isEditing = ref(false);
    const financingSystemId = parseInt(route.params.accountingSystemId as string);
    const sizeOptions = ['S', 'M', 'L'];
    const currentSize = ref('M');
    const selectedPeriods = ref<any>([]);
    const initialBudgetModal = ref(false);
    const currentInitialBudget = ref();
    const currentInitialBudgetIncomeExpense = ref();
    const currentInitialBudgetExecutionOfExpense = ref();
    const additionalOrReductionModal = ref(false);
    const currentAdditionalOrReduction = ref();
    const currentAdditionalOrReductionIncomeExpense = ref();
    const currentAdditionalOrReductionDataExecutionOfExpense = ref();
    const currentDetailAddOrRed = ref();
    const entityAdditionalOrReduction = ref();
    const entityAmountMonth = ref();
    const amountMonthFormModal = ref(false);
    const currentAmountMonthForm = ref();
    const currentDetailPeriod = ref();
    const currentDetailAmountMonth = ref();
    const currentDetailAmountMonthIncomeExpense = ref();
    const currentAmountMonthExecutionOfExpense = ref();
    const typeExpenseSource = ref<any>({});
    const associateAccountsFormModal = ref(false);
    const currentDataIncomeBill = ref();
    //CommitedAmountExpenseForm
    const currentCommitedAmountExpenseForm = ref();
    const currentDetailtPeriodCommitedAmountExpense = ref();
    const currentDetailAmountMonthCommitedExpense = ref();
    const currentDetailAmountMonthCommitedExpenseIncomeExpense = ref();
    const currentAmountMonthExecutionOfExpenseCommited = ref();
    const commitedAmountExpenseFormModal = ref(false);
    const changeTableSize = (size: any) => {
      currentSize.value = size;
    };

    const periodOptions = computed(() => {
      const allPeriods = dataBudgetPlanning.value?.[0]?.incomeExpenses?.[0]?.budgetPlanningBills?.[0]?.budgetPlanningPeriods || [];
      return allPeriods.map((period: any) => period);
    });
    // Computed para filtrar los períodos seleccionados
    const filteredPeriods = computed(() => {
      const allPeriods = dataBudgetPlanning.value?.[0]?.incomeExpenses?.[0]?.budgetPlanningBills?.[0]?.budgetPlanningPeriods || [];
      return allPeriods.filter((period: any) => selectedPeriods.value.includes(period.numberPeriod));
    });

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Presupuesto', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      try {
        const res = await getAllParentsTypesFinancingService.run(financingSystemId);
        typeExpenseSource.value = res.find((item: any) => item.reference === 'RUBROS');
        await getData();
        const allPeriods = dataBudgetPlanning.value?.[0]?.incomeExpenses?.[0]?.budgetPlanningBills?.[0]?.budgetPlanningPeriods || [];
        selectedPeriods.value = allPeriods.map((period: any) => period.numberPeriod);
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    });
    const getData = async () => {
      try {
        let params = {
          standardizedAccountingSystemId: financingSystemId,
          typeFinancingSourceId: typeExpenseSource.value.id,
        };
        dataBudgetPlanning.value = await getBudgetExpenseExecutionService.run(params);
        console.log(dataBudgetPlanning.value);
      } catch (e) {
        console.log(e);
      }
    };
    const enableEditing = () => {
      isEditing.value = true;
    };

    const disableEditing = () => {
      isEditing.value = false;
    };
    const openInitialBudgetForm = (data: any, incomeExpense: any, executionOfExpense: any) => {
      currentInitialBudget.value = data;
      currentInitialBudgetIncomeExpense.value = incomeExpense;
      currentInitialBudgetExecutionOfExpense.value = executionOfExpense?.[0];
      initialBudgetModal.value = true;
    };
    const closeInitialBudgetForm = () => {
      currentInitialBudget.value = null;
      currentInitialBudgetIncomeExpense.value = null;
      initialBudgetModal.value = false;
      getData();
    };
    const openAdditionalOrReductionForm = (data: any, detailData: any, incomeExpense: any, dataExecutionOfExpense: any, entity: string) => {
      currentAdditionalOrReduction.value = data;
      currentDetailAddOrRed.value = detailData;
      currentAdditionalOrReductionIncomeExpense.value = incomeExpense;
      currentAdditionalOrReductionDataExecutionOfExpense.value = dataExecutionOfExpense?.[0];
      entityAdditionalOrReduction.value = entity;
      additionalOrReductionModal.value = true;
    };
    const closeAdditionalOrReductionForm = () => {
      currentAdditionalOrReduction.value = null;
      additionalOrReductionModal.value = false;
      getData();
    };
    const openAmountMonthForm = (data: any, detailPeriod: any, detailData: any, incomeExpense: any, dataExecutionOfExpense: any, entity: string) => {
      currentAmountMonthForm.value = data;
      currentDetailPeriod.value = detailPeriod;
      currentDetailAmountMonth.value = detailData;
      currentDetailAmountMonthIncomeExpense.value = incomeExpense;
      currentAmountMonthExecutionOfExpense.value = dataExecutionOfExpense?.[0];
      entityAmountMonth.value = entity;
      amountMonthFormModal.value = true;
    };
    const closeAmountMonthForm = () => {
      currentAmountMonthForm.value = null;
      amountMonthFormModal.value = false;
      getData();
    };
    const openCommitedAmountExpenseForm = (data: any, detailPeriod: any, detailData: any, incomeExpense: any, dataExecutionOfExpense: any, entity: string) => {
      currentCommitedAmountExpenseForm.value = data;
      currentDetailtPeriodCommitedAmountExpense.value = detailPeriod;
      currentDetailAmountMonthCommitedExpense.value = detailData;
      currentDetailAmountMonthCommitedExpenseIncomeExpense.value = incomeExpense;
      currentAmountMonthExecutionOfExpenseCommited.value = dataExecutionOfExpense?.[0];
      entityAmountMonth.value = entity;
      commitedAmountExpenseFormModal.value = true;
    };
    const closeCommitedAmountExpenseForm = () => {
      currentCommitedAmountExpenseForm.value = null;
      commitedAmountExpenseFormModal.value = false;
      getData();
    };
    const openAssociateAccountsFormModal = (dataIncomeBill: any) => {
      currentDataIncomeBill.value = dataIncomeBill;
      associateAccountsFormModal.value = true;
    };
    const closeAssociateAccountsFormModal = () => {
      getData();
      currentDataIncomeBill.value = null;
      associateAccountsFormModal.value = false;
    };

    return {
      title,
      routes,
      loading,
      n,
      dataBudgetPlanning,
      //redirectView,
      isEditing,
      enableEditing,
      disableEditing,

      sizeOptions,
      changeTableSize,
      currentSize,
      filteredPeriods,
      selectedPeriods,
      periodOptions,

      initialBudgetModal,
      currentInitialBudget,
      currentInitialBudgetIncomeExpense,
      currentInitialBudgetExecutionOfExpense,
      openInitialBudgetForm,
      closeInitialBudgetForm,

      additionalOrReductionModal,
      currentAdditionalOrReduction,
      currentAdditionalOrReductionIncomeExpense,
      currentDetailAddOrRed,
      currentAdditionalOrReductionDataExecutionOfExpense,
      entityAdditionalOrReduction,
      openAdditionalOrReductionForm,
      closeAdditionalOrReductionForm,

      amountMonthFormModal,
      currentAmountMonthForm,
      currentDetailPeriod,
      currentDetailAmountMonth,
      currentDetailAmountMonthIncomeExpense,
      currentAmountMonthExecutionOfExpense,
      entityAmountMonth,
      openAmountMonthForm,
      closeAmountMonthForm,

      currentCommitedAmountExpenseForm,
      currentDetailtPeriodCommitedAmountExpense,
      currentDetailAmountMonthCommitedExpense,
      currentDetailAmountMonthCommitedExpenseIncomeExpense,
      currentAmountMonthExecutionOfExpenseCommited,
      commitedAmountExpenseFormModal,
      openCommitedAmountExpenseForm,
      closeCommitedAmountExpenseForm,

      associateAccountsFormModal,
      financingSystemId,
      currentDataIncomeBill,
      openAssociateAccountsFormModal,
      closeAssociateAccountsFormModal,
    };
  },
});
</script>
<style scoped>
.table-responsive {
  max-height: 80vh;
}
.table {
  border-radius: 14px;
  font-family: 'Arial', sans-serif;
  background-color: white;
}

/* Hover en filas */
.table tbody tr:hover {
  background-color: #f7f7f7;
}

.table > :not(:first-child) {
  border-top: 2px solid #dbdbdb;
}
.table thead th {
  align-content: center;
  text-align: center;
}
.table tbody td {
  align-content: center;
}

.static-colum {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 100px;
}

.s-colum-1 {
  left: 100px;
  min-width: 200px;
}

.s-colum-2 {
  left: 300px;
  min-width: 150px;
}

/* Primera fila del thead */
table thead tr:nth-child(1) {
  position: sticky;
  top: 0px;
  background: #fff;
  z-index: 2;
}

/* Segunda fila del thead */
table thead tr:nth-child(2) {
  position: sticky;
  top: 40px;
  background: #fff;
  z-index: 2;
}
.colum-execution {
  background-color: #ffefbf;
}
.colum-income {
  background-color: #d1edc1;
}
.colum-income-bill {
  background-color: #ffd5d3;
}

input {
  background: transparent;
}

.form-control {
  padding: 0.2rem 0.25rem;
  width: auto;
  text-align: center;
}

/** Revisar ccs new */
.table-size-control {
  text-align: center;
  margin-bottom: 1rem;
}

.filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 0.4rem 0.5rem;
  position: relative;
  width: fit-content;
}

.slider button {
  background-color: transparent;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  font-weight: bold;
  position: relative;
  transition: color 0.3s ease;
  border-radius: 10px;
}

.slider button:hover {
  background-color: #eaeaea;
  color: var(--color-primary);
}

.slider button.active {
  background-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.size-s {
  font-size: small;
}

.size-m {
  font-size: medium;
}

.size-l {
  font-size: larger;
}

.content-edit {
  display: flex;
  justify-content: center; /* Centra horizontalmente */
  align-items: center; /*Centra verticalmente */
  text-align: center;
}
.content-value {
  flex-grow: 1; /*Ocupar el espacio disponible */
  margin-left: 32px; /*margin de igual tamaño */
}
.content-edit .btn-edit {
  margin-left: 4px;
  width: 32px; /*tamaño del boton edit*/
}

@media (max-width: 768px) {
  .static-colum {
    left: auto;
    z-index: 1;
    min-width: auto;
  }

  .s-colum-1 {
    left: auto;
    min-width: auto;
  }

  .s-colum-2 {
    left: auto;
    min-width: auto;
  }
}
</style>
