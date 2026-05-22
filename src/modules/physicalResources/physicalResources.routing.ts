import { RouteRecordRaw } from 'vue-router';
import { authGuard } from '../../shared/guards/auth.guard';

import ResourceConfigurationPage from './pages/ResourceConfiguration.vue';
import ResourceTypesPage from './pages/ResourceTypes.vue';
import ResourceInventoryPage from './pages/ResourceInventory.vue';
import PhysicalStructurePage from './pages/PhysicalStructure.vue';
import SpaceAssignmentPage from './pages/SpaceAssignment.vue';
import PhysicalResourcesAnalyticsPage from './pages/PhysicalResourcesAnalytics.vue';
import AdminQrs from './pages/AdminQrs.vue';
import AdminQrsCreate from './pages/AdminQrsCreate.vue';
import AdminQrsEdit from './pages/AdminQrsEdit.vue';



const appName = 'physicalResources';

export const physicalResourcesRouting: RouteRecordRaw[] = [
  {
    path: 'resource-configuration',
    component: ResourceConfigurationPage,
    beforeEnter: [authGuard],
    name: `${appName}.resourceConfiguration`,
  },
  {
    path: 'resource-types',
    component: ResourceTypesPage,
    beforeEnter: [authGuard],
    name: `${appName}.resourceTypes`,
  },
  {
    path: 'resource-inventory',
    component: ResourceInventoryPage,
    beforeEnter: [authGuard],
    name: `${appName}.resourceInventory`,
  },
  {
    path: 'physical-structure',
    component: PhysicalStructurePage,
    beforeEnter: [authGuard],
    name: `${appName}.physicalStructure`,
  },
  {
    path: 'space-assignment',
    component: SpaceAssignmentPage,
    beforeEnter: [authGuard],
    name: `${appName}.spaceAssignment`,
  },
  {
    path: 'analytics',
    component: PhysicalResourcesAnalyticsPage,
    beforeEnter: [authGuard],
    name: `${appName}.analytics`,
  },
  {
    path: 'AdminQrs',
    component: AdminQrs,
    beforeEnter: [authGuard],
    name: `${appName}.AdminQrs`,
  },
  {
    path: 'AdminQrs/create',
    component: AdminQrsCreate,
    beforeEnter: [authGuard],
    name: `${appName}.qrsCreate`,
  },
  {
    path: 'AdminQrs/edit/:userId',
    component: AdminQrsEdit,
    beforeEnter: [authGuard],
    name: `${appName}.qrsedit`,
  },
];
