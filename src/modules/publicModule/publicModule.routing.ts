import developmentMapsMainBannerPage from './pages/organizational/developmentMapsAdmin.vue';
import developmentMapsPage from './pages/organizational/developmentMap.vue';
import generateGeneralReportByCollaboratorPage from './pages/organizational/generateGeneralReportByCollaborator.vue';
import generateDetailedReportByCollaboratorPage from './pages/organizational/generateDetailedReportByCollaborator.vue';
import generateReportConsolidatedPage from './pages/organizational/generateReportConsolidated.vue';
import reportConsolidatedPage from './pages/organizational/reportConsolidated.vue';

const appName = 'public';

export const publicModuleRouting = [
  {
    path: 'development-map/admin',
    component: developmentMapsMainBannerPage,
    name: `${appName}.DevelopmentMapsMainBanner`,
  },
  {
    path: 'development-map/admin/generate-general-report/:employeeId',
    component: generateGeneralReportByCollaboratorPage,
    name: `${appName}.generateGeneralReportByCollaborator`,
  },
  {
    path: 'development-map/admin/generate-detailed-report/:employeeId',
    component: generateDetailedReportByCollaboratorPage,
    name: `${appName}.generateDetailedReportByCollaborator`,
  },
  {
    path: 'development-map/admin/generate-report-consolidated/:employeeId',
    component: generateReportConsolidatedPage,
    name: `${appName}.generateReportConsolidated`,
  },
  {
    path: 'development-map/admin/report-consolidated/:employeeId',
    component: reportConsolidatedPage,
    name: `${appName}.reportConsolidated`,
  },
  {
    path: 'development-map',
    component: developmentMapsPage,
    name: `${appName}.developmentMap`,
  },
];
