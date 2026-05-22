import { RouteRecordRaw } from 'vue-router';
import { authGuard } from '../../shared/guards/auth.guard';

import ResourceConfigurationPage from './pages/ResourceConfiguration.vue';
import ResourceTypesPage from './pages/ResourceTypes.vue';
import ResourceInventoryPage from './pages/ResourceInventory.vue';
import PhysicalStructurePage from './pages/PhysicalStructure.vue';
import SpaceAssignmentPage from './pages/SpaceAssignment.vue';
import PhysicalResourcesAnalyticsPage from './pages/PhysicalResourcesAnalytics.vue';
import AdminQrs from './pages/AdminQrs.vue';



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
    name:`${appName}.AdminQrs`,
  },

];
