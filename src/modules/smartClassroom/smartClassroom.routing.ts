import TimetablesPage from './pages/TimetablesPage.vue';
import TimetableViewPage from './pages/TimetableViewPage.vue';
import HardRulesPage from './pages/HardRulesPage.vue';
import NotificationsPage from './pages/NotificationsPage.vue';

const appName = 'smartClassroom';

export const smartClassroomRouting = [
  {
    path: 'schedule',
    component: TimetablesPage,
    name: `${appName}.schedule`,
  },
  {
    path: 'schedule/:id',
    component: TimetableViewPage,
    name: `${appName}.scheduleView`,
  },
  {
    path: 'hard-rules',
    component: HardRulesPage,
    name: `${appName}.hardRules`,
  },
  {
    path: 'notifications',
    component: NotificationsPage,
    name: `${appName}.notifications`,
  },
];
