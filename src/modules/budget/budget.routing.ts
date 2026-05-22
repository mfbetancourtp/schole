//import budgetLinesPage from './pages/BudgetLines.vue';
import budgetCategoriesPage from './pages/BudgetCategories.vue';
import generalBudgetPage from './pages/GeneralBudget.vue';
import budgetLinesReportPage from './pages/BudgetLinesReport.vue';
import detailbudgetLinesReportPage from './pages/DetailBudgetLinesReport.vue';
import financingSystemsPage from './pages/financingSystems.vue';
import ImportTemplateFinancingSistemsPage from './components/ImportTemplateFinancingSistems.vue';
import typesFinancingSourcesPage from './pages/typesFinancingSources.vue';
import PeriodsAdministrationPage from './pages/periodsAdministration.vue';
import StatusAdministrationPage from './pages/StatusAdministration.vue';
import budgetValidityPage from './pages/Budgetvalidity.vue';
import incomeExecutionPage from './pages/IncomeExecution.vue';
import incomeExecutionDetailsPage from './pages/incomeExecutionDetails.vue';
import expenseExecutionPage from './pages/expenseExecution.vue';
import expenseExecutionDetailsPage from './pages/expenseExecutionDetails.vue';
import expenseExecutionCreatePage from './pages/expenseExecutionCreate.vue';
import SummaryOfBudgetValidity from './pages/SummaryOfBudgetValidity.vue';
import SystemsSourcesFinancingPage from './pages/SystemsSourcesFinancing.vue';
import SystemsExpensesFinancingPage from './pages/SystemsExpensesFinancing.vue';
import SuppliersPage from './pages/Suppliers.vue';
import GeneralAdminPage from './pages/GeneralAdmin.vue';
import ImportTemplateSuppliersPage from './components/ImportTemplateSuppliers.vue';
import ContractDocumentsPage from './pages/ContractDocuments.vue';
import CdpsBudgetPage from './pages/CdpsBudget.vue';

const appName = 'budget';

export const budgetRouting = [
  {
    path: 'budget-lines',
    component: SystemsExpensesFinancingPage,
    name: `${appName}.systemsExpensesFinancing`,
  },

  {
    path: 'budget-lines-report',
    component: budgetLinesReportPage,
    name: `${appName}.budgetLinesReport`,
  },

  {
    path: 'detail-budget-lines-report/:academicPeriodId/:budgetLineId',
    component: detailbudgetLinesReportPage,
    name: `${appName}.detailBudgetLinesReport`,
  },

  {
    path: 'budget-categories',
    component: budgetCategoriesPage,
    name: `${appName}.budgetCategories`,
  },

  {
    path: 'general-budget',
    component: generalBudgetPage,
    name: `${appName}.generalBudget`,
  },
  {
    path: 'budget-validity',
    component: budgetValidityPage,
    name: `${appName}.budgetValidity`,
  },
  {
    path: 'periods-budget-planning',
    component: PeriodsAdministrationPage,
    name: `${appName}.periodsBudgetPlanning`,
  },
  {
    path: 'status-budget-planning',
    component: StatusAdministrationPage,
    name: `${appName}.statusBudgetPlanning`,
  },
  {
    path: 'standardizeds-accounting-system',
    component: financingSystemsPage,
    name: `${appName}.standardizedAccountingSystem`,
  },
  {
    path: 'import-standardizeds-accounting-system',
    component: ImportTemplateFinancingSistemsPage,
    name: `${appName}.importTemplateFinancingSistems`,
  },
  {
    path: 'types-financing-sources/:financingSystemId',
    component: typesFinancingSourcesPage,
    name: `${appName}.typesFinancingSources`,
  },
  {
    path: 'budget-planning',
    component: incomeExecutionPage,
    name: `${appName}.incomeExecution`,
  },
  {
    path: 'income-execution-details/:accountingSystemId',
    component: incomeExecutionDetailsPage,
    name: `${appName}.incomeExecutionDetails`,
  },
  {
    path: 'budgetPlanningExpenses',
    component: expenseExecutionPage,
    name: `${appName}.expenseExecution`,
  },
  {
    path: 'expenses-execution-details/:accountingSystemId',
    component: expenseExecutionDetailsPage,
    name: `${appName}.expenseExecutionDetails`,
  },
  {
    path: 'expenses-execution-create/:accountingSystemId',
    component: expenseExecutionCreatePage,
    name: `${appName}.expenseExecutionCreate`,
  },
  {
    path: 'budget-validity/Sumamry',
    component: SummaryOfBudgetValidity,
    name: `${appName}.budgetValiditySumamry`,
  },
  {
    path: 'type-sources-of-income',
    component: SystemsSourcesFinancingPage,
    name: `${appName}.systemsSourcesFinancing`,
  },
  {
    path: 'suppliers',
    component: SuppliersPage,
    name: `${appName}.suppliers`,
  },
  {
    path: 'import-suppliers',
    component: ImportTemplateSuppliersPage,
    name: `${appName}.importSuppliers`,
  },
  {
    path: 'general-admin',
    component: GeneralAdminPage,
    name: `${appName}.generalAdmin`,
  },
  {
    path: 'contract-documents',
    component: ContractDocumentsPage,
    name: `${appName}.contractDocuments`,
  },
  {
    path: 'cdps-budget/:executionOfExpenseId',
    component: CdpsBudgetPage,
    name: `${appName}.CdpsBudget`,
  },
];
