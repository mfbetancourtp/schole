import { RouteRecordRaw } from 'vue-router';

import ConfigureMenuPage from './pages/ConfigureMenu.vue'
import ConfigureTablePage from './pages/ConfigureTable.vue'
import ModulesPage from './pages/Modules.vue'
import ConfigureInterfacesPage from './pages/ConfigureInterfaces.vue'
import ConfigureInferfacesEditPage from './pages/ConfigureInterfacesEdit.vue'
import ConfigureInterfacesCreatePage from './pages/ConfigureInterfacesCreate.vue'

const appName = 'superAdmin';

export const superAdminRouting: RouteRecordRaw[] = [
  {
    path: 'configure-menu',
    component: ConfigureMenuPage,
    name: `${appName}.configureMenu`,
  },
  {
    path: 'configure-interface',
    component: ConfigureInterfacesPage,
    name: `${appName}.configureInterface`,
  },
  {
    path: 'configure-interfaces/:interfaceId/edit',
    component: ConfigureInferfacesEditPage,
    name: `${appName}.configureInterfacesEdit`,
  },
  {
    path: 'configure-interfaces/create',
    component: ConfigureInterfacesCreatePage,
    name: `${appName}.configureInterfacesCreate`,
  },
  {
    path: 'configure-table',
    component: ConfigureTablePage,
    name: `${appName}.configureTable`,
  },
  {
    path: 'modules',
    component: ModulesPage,
    name: `${appName}.modules`,
  },
];