import typesAgreementsPage from './pages/typesAgreementsPage.vue';
import agreementTypeFormPage from './pages/agreementTypeFormPage.vue';
import agreementsPage from './pages/agreementsPage.vue';
import agreementApplicationsPage from './pages/agreementApplicationsPage.vue';
import myApplicationsPage from './pages/myApplicationsPage.vue';
import availableAgreementsPage from './pages/availableAgreementsPage.vue';

const appName = 'institutionalAgreements';

export const institutionalAgreementsRouting = [
  {
    path: 'types-agreements',
    component: typesAgreementsPage,
    name: `${appName}.typesAgreements`,
  },
  {
    path: 'types-agreements/create',
    component: agreementTypeFormPage,
    name: `${appName}.typesAgreements.create`,
  },
  {
    path: 'types-agreements/:id/edit',
    component: agreementTypeFormPage,
    name: `${appName}.typesAgreements.edit`,
  },
  {
    path: 'agreements',
    component: agreementsPage,
    name: `${appName}.agreements`,
  },
  {
    path: 'agreements/:id/applications',
    component: agreementApplicationsPage,
    name: `${appName}.agreements.applications`,
  },
  {
    path: 'applications',
    component: myApplicationsPage,
    name: `${appName}.myApplications`,
  },
  {
    path: 'available',
    component: availableAgreementsPage,
    name: `${appName}.availableAgreements`,
  },
];
