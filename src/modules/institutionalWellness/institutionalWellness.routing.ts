import { authGuard } from '../../shared/guards/auth.guard';
import ServiceCatalogPage from './pages/ServiceCatalog.vue';
import MyAppointmentsPage from './pages/MyAppointments.vue';
import RequestTrackingPage from './pages/RequestTracking.vue';
import ServiceConfigPage from './pages/ServiceConfig.vue';

const appName = 'institutionalWellness';

export const institutionalWellnessRouting = [
  {
    path: 'service-catalog',
    beforeEnter: [authGuard],
    component: ServiceCatalogPage,
    name: `${appName}.serviceCatalog`,
  },
  {
    path: 'my-appointments',
    beforeEnter: [authGuard],
    component: MyAppointmentsPage,
    name: `${appName}.myAppointments`,
  },
  {
    path: 'request-tracking',
    beforeEnter: [authGuard],
    component: RequestTrackingPage,
    name: `${appName}.requestTracking`,
  },
  {
    path: 'service-config',
    beforeEnter: [authGuard],
    component: ServiceConfigPage,
    name: `${appName}.serviceConfig`,
  },
];
