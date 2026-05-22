import ReportListPage from './pages/ReportList.vue';

import ReportCardPage from './pages/ReportCard.vue';
import ReportCardEndOfYear from './pages/ReportCardEndOfYear.vue';
import ReportPeaceSafety from './pages/ReportPeaceSafety.vue';

const appName = 'reportsStudent';

export const reportsStudentRouting = [
  {
    path: '',
    component: ReportListPage,
    name: `${appName}`,
  },

  {
    path: 'report-card',
    component: ReportCardPage,
    name: `${appName}.reportCard`,
  },
  {
    path: 'end-of-year',
    component: ReportCardEndOfYear,
    name: `${appName}.endOfYear`,
  },
  {
    path: 'peace-safety',
    component: ReportPeaceSafety,
    name: `${appName}.peaceSafety`,
  },
];
