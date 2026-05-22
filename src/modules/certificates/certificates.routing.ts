import { authGuard } from '../../shared/guards/auth.guard';
import CertificatesListPage from './pages/CertificatesList.vue';
import CertificateCreatePage from './pages/CertificateCreate.vue';
import DegreesDashboardPage from './pages/DegreesDashboard.vue';
import ProgressTrackingPage from './pages/ProgressTracking.vue';
import ProjectPostulationListPage from './pages/ProjectPostulationList.vue';
import ProjectPostulationCreatePage from './pages/ProjectPostulation.vue';
import TutorPanelPage from './pages/TutorPanel.vue';
import CoordinationPanelPage from './pages/CoordinationPanel.vue';
import JuryAssignmentPage from './pages/JuryAssignment.vue';
import ScheduleConfigPage from './pages/ScheduleConfig.vue';
import DefenseCalendarPage from './pages/DefenseCalendar.vue';

const appName = 'certificates';

export const certificatesRouting = [
  {
    path: 'dashboard',
    beforeEnter: [authGuard],
    component: DegreesDashboardPage,
    name: `${appName}.degreesDashboard`,
  },
  {
    path: 'project-postulation',
    beforeEnter: [authGuard],
    component: ProjectPostulationListPage,
    name: `${appName}.projectPostulation`,
  },
  {
    path: 'project-postulation/create',
    beforeEnter: [authGuard],
    component: ProjectPostulationCreatePage,
    name: `${appName}.projectPostulationCreate`,
  },
  {
    path: 'tracking/:id',
    beforeEnter: [authGuard],
    component: ProgressTrackingPage,
    name: `${appName}.progressTracking`,
  },
  {
    path: 'tutor-panel',
    beforeEnter: [authGuard],
    component: TutorPanelPage,
    name: `${appName}.tutorPanel`,
  },
  {
    path: 'coordination-panel',
    beforeEnter: [authGuard],
    component: CoordinationPanelPage,
    name: `${appName}.coordinationPanel`,
  },
  {
    path: 'jury-assignment',
    beforeEnter: [authGuard],
    component: JuryAssignmentPage,
    name: `${appName}.juryAssignment`,
  },
  {
    path: 'sustenance-calendar',
    beforeEnter: [authGuard],
    component: DefenseCalendarPage,
    name: `${appName}.defenseCalendar`,
  },
  {
    path: 'schedule-config',
    beforeEnter: [authGuard],
    component: ScheduleConfigPage,
    name: `${appName}.scheduleConfig`,
  },
  {
    path: 'certificates-list',
    beforeEnter: [authGuard],
    component: CertificatesListPage,
    name: `${appName}.certificatesList`,
  },
  {
    path: 'certificates-create',
    beforeEnter: [authGuard],
    component: CertificateCreatePage,
    name: `${appName}.certificateCreate`,
  },
  {
    path: 'certificates-edit/:id',
    beforeEnter: [authGuard],
    component: CertificateCreatePage,
    name: `${appName}.certificateEdit`,
  },
];
