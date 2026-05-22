import { authGuard } from '../../shared/guards/auth.guard';
import MetricsAndReportsPage from './pages/MetricsAndReports.vue';
import DocumentRequestPage from './pages/DocumentRequest.vue';
import RequestManagementPage from './pages/RequestManagement.vue';
import RequestConfigurationPage from './pages/RequestConfiguration.vue';
import DocumentTemplatesPage from './pages/DocumentTemplates.vue';
import DocumentTemplateEditorPage from './pages/DocumentTemplateEditor.vue';
import ApplicationDocumentsPage from './pages/ApplicationDocumentsPage.vue';

const appName = 'requestManagement';

export const requestManagementRouting = [
  {
    path: 'document-request',
    beforeEnter: [authGuard],
    component: DocumentRequestPage,
    name: `${appName}.documentRequest`,
  },
  {
    path: 'request',
    beforeEnter: [authGuard],
    component: RequestManagementPage,
    name: `${appName}.request`,
  },
  {
    path: 'request-configuration',
    beforeEnter: [authGuard],
    component: RequestConfigurationPage,
    name: `${appName}.requestConfiguration`,
  },
  {
    path: 'document-templates',
    beforeEnter: [authGuard],
    component: DocumentTemplatesPage,
    name: `${appName}.documentTemplates`,
  },
  {
    path: 'document-templates/:id/editor',
    beforeEnter: [authGuard],
    component: DocumentTemplateEditorPage,
    name: `${appName}.documentTemplateEditor`,
  },
  {
    path: 'metrics-and-reports',
    beforeEnter: [authGuard],
    component: MetricsAndReportsPage,
    name: `${appName}.metricsAndReports`,
  },
  {
    path: 'application-documents',
    beforeEnter: [authGuard],
    component: ApplicationDocumentsPage,
    name: `${appName}.applicationDocuments`,
  },
];
