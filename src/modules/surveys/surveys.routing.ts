import { authGuard } from '../../shared/guards/auth.guard';
import { RouteRecordRaw } from 'vue-router';

import AppLayout from '../../shared/layout/AppLayout.vue';
import NavBar from './components/NavBar.vue';
import ChecklistManagementPage from './pages/ChecklistManagement.vue';
import ChecklistDetailPage from './pages/ChecklistDetail.vue';

import ConceptsPage from './pages/Concepts.vue';
import ConceptEditPage from './pages/ConceptEdit.vue';
import ConceptCreatePage from './pages/ConceptCreate.vue';
import DiscountsPage from './pages/Discounts.vue';
import CustomFormsPage from './pages/CustomForms.vue';
import CustomFormCreatePage from './pages/CustomFormCreate.vue';
import CustomFormEditPage from './pages/CustomFormEdit.vue';
import AttachmentsPage from './pages/Attachments.vue';
import DocumentsPage from './pages/Documents.vue';
import DocumentsCreatePage from './pages/DocumentsCreate.vue';
import DocumentsEditPage from './pages/DocumentsEdit.vue';
import AdmissionProcessesPage from './pages/AdmissionProcesses.vue';
import ApplicationsPage from './pages/Applications.vue';
import ApplicationDetail from './pages/ApplicationDetail.vue';
import ConvocationsPage from './pages/Convocations.vue';
import ConvocationCreatePage from './pages/ConvocationCreate.vue';
import ConvocationEditPage from './pages/ConvocationEdit.vue';
import ConvocationStepsPage from './pages/ConvocationSteps.vue';

import StepTypeCobroPage from './pages/StepTypeCobro.vue';
import MyConvocationsPage from './pages/MyConvocations.vue';
import StepTypeAdjuntoPage from './pages/StepTypeAdjunto.vue';
import UserConvocationsPage from './pages/UserConvocations.vue';
import StepTypeDocumentoPage from './pages/StepTypeDocumento.vue';
import StepTypeFormularioPage from './pages/StepTypeFormulario.vue';
import ConvocationInscripcionPage from './pages/ConvocationInscripcion.vue';
import RegistrationStepsConvocationPage from './pages/RegistrationStepsConvocation.vue';
import RegistrationStepsConvocationModernPage from './pages/RegistrationStepsConvocationModern.vue';
import RegistrationModernExamPage from './pages/RegistrationModernExam.vue';

import EditInvoicePage from './pages/EditInvoice.vue';
import InscritosByStepPage from './pages/InscritosByStep.vue';
import InscritoDetailsAttachmentAndDocumentPage from './pages/InscritoDetailsAttachmentAndDocument.vue';
import AdminConvocatoriaPreviewInscritosPage from './pages/AdminConvocatoriaPreviewInscritos.vue';
import AdminConvocationSummaryInscritosPage from './pages/AdminConvocationSummaryInscritos.vue';
import EnrollEnrolleesPage from './pages/EnrollEnrollees.vue';

const appName = 'surveys';

export const surveysRouting: RouteRecordRaw[] = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: 'checklists',
        beforeEnter: [authGuard],
        component: ChecklistManagementPage,
        name: `${appName}.checklistManagement`,
      },
      {
        path: 'checklists/:checklistId/detail',
        beforeEnter: [authGuard],
        component: ChecklistDetailPage,
        name: `${appName}.checklistDetail`,
      },
      {
        path: 'concepts',
        beforeEnter: [authGuard],
        component: ConceptsPage,
        name: `${appName}.conceptsList`,
      },
      {
        path: 'concept/create',
        beforeEnter: [authGuard],
        component: ConceptCreatePage,
        name: `${appName}.conceptCreate`,
      },
      {
        path: 'concept/:conceptId/edit',
        beforeEnter: [authGuard],
        component: ConceptEditPage,
        name: `${appName}.conceptEdit`,
      },
      {
        path: 'discounts',
        beforeEnter: [authGuard],
        component: DiscountsPage,
        name: `${appName}.discounts`,
      },
      {
        path: 'custom-forms',
        beforeEnter: [authGuard],
        component: CustomFormsPage,
        name: `${appName}.customFormsList`,
      },
      {
        path: 'custom-forms/create',
        beforeEnter: [authGuard],
        component: CustomFormCreatePage,
        name: `${appName}.customFormsCreate`,
      },
      {
        path: 'custom-forms/:formId/edit',
        beforeEnter: [authGuard],
        component: CustomFormEditPage,
        name: `${appName}.customFormsEdit`,
      },
      {
        path: 'attachments',
        beforeEnter: [authGuard],
        component: AttachmentsPage,
        name: `${appName}.attachmentsList`,
      },
      {
        path: 'documents',
        beforeEnter: [authGuard],
        component: DocumentsPage,
        name: `${appName}.documentsList`,
      },
      {
        path: 'documents/create',
        beforeEnter: [authGuard],
        component: DocumentsCreatePage,
        name: `${appName}.documentsCreate`,
      },
      {
        path: 'documents/:documentId/edit',
        beforeEnter: [authGuard],
        component: DocumentsEditPage,
        name: `${appName}.documentsEdit`,
      },
      {
        path: 'admission-processes',
        beforeEnter: [authGuard],
        component: AdmissionProcessesPage,
        name: `${appName}.admissionProcessesList`,
      },
      {
        path: 'applications',
        beforeEnter: [authGuard],
        component: ApplicationsPage,
        name: `${appName}.applicationsList`,
      },
      {
        path: 'applications/:applicationId/detail',
        beforeEnter: [authGuard],
        component: ApplicationDetail,
        name: `${appName}.applicationDetail`,
      },
      {
        path: 'convocations',
        beforeEnter: [authGuard],
        component: ConvocationsPage,
        name: `${appName}.convocationsList`,
      },
      {
        path: 'convocations/create',
        beforeEnter: [authGuard],
        component: ConvocationCreatePage,
        name: `${appName}.convocationsCreate`,
      },
      {
        path: 'convocations/:convocationId/edit',
        beforeEnter: [authGuard],
        component: ConvocationEditPage,
        name: `${appName}.convocationsEdit`,
      },
      {
        path: 'convocations/:convocationId/steps',
        beforeEnter: [authGuard],
        component: ConvocationStepsPage,
        name: `${appName}.convocationStepsList`,
      },
      {
        path: 'convocations/:convocationId/preview-inscritos',
        beforeEnter: [authGuard],
        component: AdminConvocatoriaPreviewInscritosPage,
        name: `${appName}.previewInscritos`,
      },
      {
        path: 'convocations/:convocationId/preview-inscritos/detailed-summary',
        beforeEnter: [authGuard],
        component: AdminConvocationSummaryInscritosPage,
        name: `${appName}.adminConvocationSummaryInscritos`,
      },
      {
        path: 'convocations/:convocationId/preview-inscritos/detailed-summary/enroll-enrollees',
        beforeEnter: [authGuard],
        component: EnrollEnrolleesPage,
        name: `${appName}.enrollEnrollees`,
      },
      {
        path: 'convocations/:convocationId/preview-inscritos/:convocationStepId/inscritos-by-step',
        beforeEnter: [authGuard],
        component: InscritosByStepPage,
        name: `${appName}.inscritosByStep`,
      },
      {
        path: 'convocations/:convocationId/preview-inscritos/:convocationStepId/inscritos-by-step/:invoiceId/edit-invoice',
        beforeEnter: [authGuard],
        component: EditInvoicePage,
        name: `${appName}.editInvoice`,
      },
      {
        path: 'convocations/:convocationId/preview-inscritos/:convocationStepId/inscritos-by-step/:convocationEnrolStepId/verify-attachments-and-documents',
        beforeEnter: [authGuard],
        component: InscritoDetailsAttachmentAndDocumentPage,
        name: `${appName}.inscritoDetailsAttachmentAndDocument`,
      },
    ],
  },

  {
    path: 'user-convocations/:institutionId',
    component: NavBar,
    children: [
      {
        path: '',
        component: UserConvocationsPage,
        name: `${appName}.userConvocations`,
      },
      {
        path: 'my-convocations',
        beforeEnter: [authGuard],
        component: MyConvocationsPage,
        name: `${appName}.userConvocations.myConvocationsPage`,
      },
      {
        path: 'convocation/:convocationId/inscripcion',
        component: ConvocationInscripcionPage,
        name: `${appName}.convocationInscripcion`,
      },
      {
        path: 'convocation/:convocationId/registration/:convocationEnrollId',
        beforeEnter: [authGuard],
        component: RegistrationStepsConvocationPage,
        name: `${appName}.userConvocations.registration`,
      },
      {
        path: 'convocation/:convocationId/registration/:convocationEnrollId/modern',
        beforeEnter: [authGuard],
        component: RegistrationStepsConvocationModernPage,
        name: `${appName}.userConvocations.registrationModern`,
      },
      {
        path: 'convocation/:convocationId/registration/:convocationEnrollId/modern/exam/:stepId',
        beforeEnter: [authGuard],
        component: RegistrationModernExamPage,
        name: `${appName}.userConvocations.registrationModern.exam`,
      },
      {
        path: 'convocation/:convocationId/registration/:convocationEnrollId/document-type-step/:stepId',
        beforeEnter: [authGuard],
        component: StepTypeDocumentoPage,
        name: `${appName}.userConvocations.registration.stepDocumento`,
      },
      {
        path: 'convocation/:convocationId/registration/:convocationEnrollId/form-type-step/:stepId',
        beforeEnter: [authGuard],
        component: StepTypeFormularioPage,
        name: `${appName}.userConvocations.registration.stepFormulario`,
      },
      {
        path: 'convocation/:convocationId/registration/:convocationEnrollId/attachment-type-step/:stepId',
        beforeEnter: [authGuard],
        component: StepTypeAdjuntoPage,
        name: `${appName}.userConvocations.registration.stepAdjunto`,
      },
      {
        path: 'convocation/:convocationId/registration/:convocationEnrollId/charge-type-step/:stepId',
        beforeEnter: [authGuard],
        component: StepTypeCobroPage,
        name: `${appName}.userConvocations.registration.stepCobro`,
      },
    ],
  },
];
