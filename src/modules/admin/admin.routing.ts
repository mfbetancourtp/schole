// import HomePage from './pages/Home.vue';
import PowerBiDashboard from './pages/PowerBiDashboard.vue';
import { RouteRecordRaw } from 'vue-router';
import { authGuard } from '../../shared/guards/auth.guard';

const appName = 'admin';

export const adminRouting: RouteRecordRaw[] = [
  {
    path: 'home',
    component: PowerBiDashboard,
    beforeEnter: [authGuard],
    name: `${appName}.home`,
  },
  // {
  //     path: 'powerbi',
  //     component: PowerBiDashboard,
  //     beforeEnter: [authGuard],
  //     name: `${appName}.powerbi`,
  // },
];
