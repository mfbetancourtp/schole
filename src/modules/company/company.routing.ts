import LmsPlatformsPage from './pages/LmsPlatforms.vue';
import organizationalStructurePage from './pages/OrganizationalStructure.vue';
import organizationalStructureTemplatePage from './pages/OrganizationalStructureTemplate.vue';
import MyMapPage from './pages/MyMap.vue';

const appName = 'company';

export const companyRouting = [
  {
    path: 'lms-platforms',
    component: LmsPlatformsPage,
    name: `${appName}.lmsPlatforms`,
  },

  {
    path: 'organizational-structure',
    component: organizationalStructurePage,
    name: `${appName}.organizationalStructure`,
  },
  {
    path: 'organizational-structure/load-template',
    component: organizationalStructureTemplatePage,
    name: `${appName}.organizationalStructureTemplate`,
  },

  {
    path: 'my-map',
    component: MyMapPage,
    name: `${appName}.myMap`,
  },
];
