import { RouteRecordRaw } from 'vue-router';
import { authGuard } from '../../shared/guards/auth.guard';
import ProfessionalProfilePage from './pages/ProfessionalProfile.vue';
import JobBoardPage from './pages/JobBoard.vue';
import CompaniesPage from './pages/Companies.vue';
import CommunityPage from './pages/Community.vue';
import GraduateTrackingPage from './pages/GraduateTracking.vue';
import GeneralConfigurationPage from './pages/GeneralConfiguration.vue';

const appName = 'graduates';

export const graduatesRouting: RouteRecordRaw[] = [
  {
    path: 'professional-profile',
    component: ProfessionalProfilePage,
    beforeEnter: [authGuard],
    name: `${appName}.professionalProfile`,
  },
  {
    path: 'job-board',
    component: JobBoardPage,
    beforeEnter: [authGuard],
    name: `${appName}.jobBoard`,
  },
  {
    path: 'companies',
    component: CompaniesPage,
    beforeEnter: [authGuard],
    name: `${appName}.companies`,
  },
  {
    path: 'community',
    component: CommunityPage,
    beforeEnter: [authGuard],
    name: `${appName}.community`,
  },
  {
    path: 'tracking',
    component: GraduateTrackingPage,
    beforeEnter: [authGuard],
    name: `${appName}.tracking`,
  },
  {
    path: 'general-configuration',
    component: GeneralConfigurationPage,
    beforeEnter: [authGuard],
    name: `${appName}.generalConfiguration`,
  },
];
