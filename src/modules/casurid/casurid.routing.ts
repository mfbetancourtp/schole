import CasuridLayout from './layouts/CasuridLayout.vue';
import HomePage from './pages/Home.vue';
import ShoppingCartPage from './pages/ShoppingCart.vue';
import ProductDetailPage from './pages/ProductDetail.vue';
import ShoppingPage from './pages/Shopping.vue';
import RegisterCostumerPage from './pages/RegisterCostumer.vue';
import ConfirmationPage from './pages/Confirmation.vue';
import ContentsPage from './pages/Contents.vue';
import AppLayout from '../../shared/layout/AppLayout.vue';
import ContentsCreatePage from './pages/ContentsCreate.vue';
import ContentsEditPage from './pages/ContentsEdit.vue';
import PlansPage from './pages/Plans.vue';
import PlansCreatePage from './pages/PlansCreate.vue';
import PlansEditPage from './pages/PlansEdit.vue';
import InstitutionsPage from './pages/Institutions.vue';
import InstitutionsCreatePage from './pages/InstitutionsCreate.vue';
import InstitutionsEditPage from './pages/InstitutionsEdit.vue';
import ContentPlanByInstitutionPage from './pages/contentPlanByInstitution.vue';
import SalesPage from './pages/Sales.vue';
import SalesEditPage from './pages/SalesEdit.vue';
import ProfilePage from './pages/Profile.vue';
import QuotasPage from './pages/Quotas.vue';
import MyQuotasPage from './pages/MyQuotas.vue';
import CollectionsPage from './pages/Collections.vue';
import ModulesPage from './pages/Modules.vue';
import ItemsPage from './pages/Items.vue';
import ContentsImportPage from './pages/ContentsImport.vue';
import ContentsImportCreatePage from './pages/ContentsImportCreate.vue';
import ContentsImportUpdatePage from './pages/ContentsImportUpdate.vue';
import LoginPage from './pages/Login.vue';
import AppEmptyLayout from '../../shared/layout/AppEmptyLayout.vue';
import RememberPasswordRequestPage from './pages/RememberPasswordRequest.vue';
import ChangePasswordPage from './pages/ChangePassword.vue';

import { authGuardCasurid } from './guards/auth.guard';

const appName = 'casurid';

export const casuridRouting = [
  {
    // path: 'casurid',
    path: 'portal',
    component: AppEmptyLayout,
    children: [
      {
        path: 'login',
        component: LoginPage,
        name: `${appName}.casuridLogin`,
      },
      {
        path: 'remember-password',
        component: RememberPasswordRequestPage,
        name: `${appName}.rememberPasswordRequest`,
      },
      {
        path: 'change-password',
        component: ChangePasswordPage,
        name: `${appName}.changePassword`,
      },
    ],
  },
  {
    path: '',
    component: CasuridLayout,
    children: [
      {
        path: 'portal-contents',
        component: HomePage,
      },
      {
        path: 'shopping-cart',
        component: ShoppingCartPage,
        beforeEnter: [authGuardCasurid],
        name: `${appName}.shoppingCart`,
      },
      {
        path: 'detail/:slug',
        component: ProductDetailPage,
      },
      {
        path: 'shopping',
        component: ShoppingPage,
        beforeEnter: [authGuardCasurid],
      },
      {
        path: 'register',
        component: RegisterCostumerPage,
        name: `${appName}.register`,
      },
      {
        path: 'confirmation',
        component: ConfirmationPage,
      },
      {
        path: 'profile',
        component: ProfilePage,
        beforeEnter: [authGuardCasurid],
        name: `${appName}.profile`,
      },
      {
        path: 'my-quotas',
        component: MyQuotasPage,
        beforeEnter: [authGuardCasurid],
        name: `${appName}.myQuotas`,
      },
    ],
  },
  {
    path: '',
    component: AppLayout,
    beforeEnter: [authGuardCasurid],
    children: [
      {
        path: 'contents',
        component: ContentsPage,
        name: `${appName}.contentsList`,
      },
      {
        path: 'contents/create',
        component: ContentsCreatePage,
        name: `${appName}.contentsCreate`,
      },
      {
        path: 'contents/:contentId/edit',
        component: ContentsEditPage,
        name: `${appName}.contentsEdit`,
      },
      {
        path: 'contents/import',
        component: ContentsImportPage,
        name: `${appName}.contentsImportList`,
      },
      {
        path: 'contents/import/create',
        component: ContentsImportCreatePage,
        name: `${appName}.contentsImportCreate`,
      },
      {
        path: 'contents/import/:importId/edit',
        component: ContentsImportUpdatePage,
        name: `${appName}.contentsImportEdit`,
      },
      {
        path: 'plans',
        component: PlansPage,
        name: `${appName}.plansList`,
      },
      {
        path: 'plans/create',
        component: PlansCreatePage,
        name: `${appName}.plansCreate`,
      },
      {
        path: 'plans/:planId/edit',
        component: PlansEditPage,
        name: `${appName}.plansEdit`,
      },
      {
        path: 'sales',
        component: SalesPage,
        name: `${appName}.salesList`,
      },
      {
        path: 'sales/:saleId/edit',
        component: SalesEditPage,
        name: `${appName}.salesEdit`,
      },
      {
        path: 'institutions',
        component: InstitutionsPage,
        name: `${appName}.institutionsList`,
      },
      {
        path: 'institutions/create',
        component: InstitutionsCreatePage,
        name: `${appName}.institutionsCreate`,
      },
      {
        path: 'institutions/:institutionId/edit',
        component: InstitutionsEditPage,
        name: `${appName}.institutionsEdit`,
      },
      {
        path: 'institutions/:institutionId/contentPlan',
        component: ContentPlanByInstitutionPage,
        name: `${appName}.institutionsContentPlan`,
      },
      {
        path: 'quotas',
        component: QuotasPage,
        name: `${appName}.quotasList`,
      },
      {
        path: 'collections',
        component: CollectionsPage,
        name: `${appName}.collectionsList`,
      },
      {
        path: 'modules',
        component: ModulesPage,
        name: `${appName}.modulesList`,
      },
      {
        path: 'items',
        component: ItemsPage,
        name: `${appName}.itemsList`,
      },
    ],
  },
];
