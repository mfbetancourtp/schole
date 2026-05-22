import { authGuard } from '../../shared/guards/auth.guard';
import SurchargesPage from './pages/Surcharges.vue';
import CollectionStepsPage from './pages/CollectionSteps.vue';
import CreateCollectionStepsPage from './pages/CreateCollectionSteps.vue';
import EditCollectionStepsPage from './pages/EditCollectionSteps.vue';
import SyncCollectionPage from './pages/SyncCollection.vue';
import ImportTemplateCollectionPage from './pages/ImportTemplateCollection.vue';
import ImportTemplatePaymentsPage from './pages/ImportTemplatePayments.vue';
import MyInvoicesPage from './pages/MyInvoices.vue';
import PortfolioMonitoringPage from './pages/PortfolioMonitoring.vue';
import PortfolioMonitoringByStudentPage from './pages/PortfolioMonitoringByStudent.vue';
import ExportCollectionPage from './pages/ExportCollection.vue';
import PaymentMethodsPage from './pages/PaymentMethods.vue';
import ExportPaymentsPage from './pages/ExportPayments.vue';
import SendMessageOrToLegalCollectionsPage from './pages/SendMessageOrToLegalCollections.vue';
import PortfolioConceptsPage from './pages/PortfolioConcepts.vue';
import PortfolioDiscountsPage from './pages/PortfolioDiscounts.vue';
import PortfolioConceptEditPage from './pages/PortfolioConceptEdit.vue';
import PortfolioConceptCreatePage from './pages/PortfolioConceptCreate.vue';

const appName = 'collections';

export const collectionsRouting = [
  {
    path: 'portfolio-concepts',
    beforeEnter: [authGuard],
    component: PortfolioConceptsPage,
    name: `${appName}.portfolioConceptsList`,
  },
  {
    path: 'portfolio-concept/create',
    beforeEnter: [authGuard],
    component: PortfolioConceptCreatePage,
    name: `${appName}.portfolioConceptCreate`,
  },
  {
    path: 'portfolio-concept/:conceptId/edit',
    beforeEnter: [authGuard],
    component: PortfolioConceptEditPage,
    name: `${appName}.portfolioConceptEdit`,
  },
  {
    path: 'portfolio-discounts',
    beforeEnter: [authGuard],
    component: PortfolioDiscountsPage,
    name: `${appName}.portfolioDiscountsList`,
  },

  {
    path: 'surcharges',
    component: SurchargesPage,
    name: `${appName}.surchargesList`,
  },

  {
    path: 'collection-steps',
    component: CollectionStepsPage,
    name: `${appName}.collectionStepsList`,
  },
  {
    path: 'collection-steps/create',
    component: CreateCollectionStepsPage,
    name: `${appName}.collectionStepsCreate`,
  },
  {
    path: 'collection-steps/:collectionStepId/edit',
    component: EditCollectionStepsPage,
    name: `${appName}.collectionStepsEdit`,
  },

  {
    path: 'sync-collections',
    component: SyncCollectionPage,
    name: `${appName}.syncCollections`,
  },
  {
    path: 'sync-collections/import-collection',
    component: ImportTemplateCollectionPage,
    name: `${appName}.syncCollectionsImportCollection`,
  },
  {
    path: 'sync-collections/import-payments',
    component: ImportTemplatePaymentsPage,
    name: `${appName}.syncCollectionsImportPayments`,
  },
  {
    path: 'sync-collections/export-collection',
    component: ExportCollectionPage,
    name: `${appName}.exportCollection`,
  },
  {
    path: 'sync-collections/export-payments',
    component: ExportPaymentsPage,
    name: `${appName}.exportPayments`,
  },

  {
    path: 'my-invoices',
    component: MyInvoicesPage,
    name: `${appName}.myInvoices`,
  },

  {
    path: 'portfolio-monitoring',
    component: PortfolioMonitoringPage,
    name: `${appName}.portfolioMonitoring`,
  },
  {
    path: 'portfolio-monitoring/student/:matriculateId',
    component: PortfolioMonitoringByStudentPage,
    name: `${appName}.portfolioMonitoringByStudent`,
  },
  {
    path: 'portfolio-monitoring/student/:matriculateId/:goTo',
    component: SendMessageOrToLegalCollectionsPage,
    name: `${appName}.sendMessageOrToLegalCollections`,
  },

  {
    path: 'payment-methods',
    component: PaymentMethodsPage,
    name: `${appName}.paymentMethods`,
  },
];
