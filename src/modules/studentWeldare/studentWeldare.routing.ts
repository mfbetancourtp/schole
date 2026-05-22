import { RouteRecordRaw } from 'vue-router';
import { authGuard } from '../../shared/guards/auth.guard';
import ScholarshipCatalogPage from './pages/ScholarshipCatalog.vue';
import ScholarshipApplicationPage from './pages/ScholarshipApplication.vue';
import MyApplicationsPage from './pages/MyApplications.vue';
import ScholarshipApplicationsAdminPage from './pages/ScholarshipApplicationsAdmin.vue';
import TypesOfScholarshipsPage from './pages/TypesOfScholarships.vue';
import ScholarshipManagementPage from './pages/ScholarshipManagement.vue';
import ScholarshipStatusesPage from './pages/ScholarshipStatuses.vue';
import AttachmentManagementPage from './pages/AttachmentManagement.vue';

const appName = 'studentWeldare';

export const studentWeldareRouting: RouteRecordRaw[] = [
  {
    path: 'scholarshipCatalog',
    component: ScholarshipCatalogPage,
    beforeEnter: [authGuard],
    name: `${appName}.scholarshipCatalog`,
  },
  {
    path: 'scholarshipApplication',
    component: ScholarshipApplicationPage,
    beforeEnter: [authGuard],
    name: `${appName}.scholarshipApplication`,
  },
  {
    path: 'myApplications',
    component: MyApplicationsPage,
    beforeEnter: [authGuard],
    name: `${appName}.myApplications`,
  },
  {
    path: 'scholarshipApplications',
    component: ScholarshipApplicationsAdminPage,
    beforeEnter: [authGuard],
    name: `${appName}.scholarshipApplications`,
  },
  {
    path: 'typesOfScholarships',
    component: TypesOfScholarshipsPage,
    beforeEnter: [authGuard],
    name: `${appName}.typesOfScholarships`,
  },
  {
    path: 'scholarshipManagement',
    component: ScholarshipManagementPage,
    beforeEnter: [authGuard],
    name: `${appName}.scholarshipManagement`,
  },
  {
    path: 'scholarship-Status',
    component: ScholarshipStatusesPage,
    beforeEnter: [authGuard],
    name: `${appName}.scholarshipStatuses`,
  },
  {
    path: 'attachment-Management',
    component: AttachmentManagementPage,
    beforeEnter: [authGuard],
    name: `${appName}.attachmentManagement`,
  },
];
