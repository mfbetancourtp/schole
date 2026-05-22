import AuxiliaryInformationPage from './pages/AuxiliaryInformation.vue';
import LmsPlatformsPage from './pages/LmsPlatforms.vue';
import systemAuditsPage from './pages/SystemAudits.vue';
import LoginAudits from './pages/LoginAudits.vue';
import OrganizationalStructurePage from './pages/OrganizationalStructure.vue';
import EducationalLevelsPage from './pages/EducationalLevels.vue';
import AcademicProgramsPage from './pages/AcademicPrograms.vue';
import CurricularGridsPage from './pages/CurricularGrids.vue';
import CurricularGridManagePage from './pages/CurricularGridManage.vue';

const appName = 'institutionalConfiguration';

export const institutionalConfigurationRouting = [
  {
    path: 'auxiliary-information',
    component: AuxiliaryInformationPage,
    name: `${appName}.auxiliaryInformation`,
  },
  {
    path: 'lms-platforms',
    component: LmsPlatformsPage,
    name: `${appName}.lmsPlatforms`,
  },
  {
    path: 'system-audits',
    component: systemAuditsPage,
    name: `${appName}.SystemAudits`,
  },
  {
    path: 'login-audits',
    component: LoginAudits,
    name: `${appName}.loginAudits`,
  },
  {
    path: 'organizationalStructure',
    component: OrganizationalStructurePage,
    name: `${appName}.organizationalStructure`,
  },
  {
    path: 'educationalLevels',
    component: EducationalLevelsPage,
    name: `${appName}.educationalLevels`,
  },
  {
    path: 'academicPrograms',
    component: AcademicProgramsPage,
    name: `${appName}.academicPrograms`,
  },
  {
    path: 'academicPrograms/:id/curricular-grids',
    component: CurricularGridsPage,
    name: `${appName}.curricularGrids`,
  },
  {
    path: 'academicPrograms/:id/curricular-grids/:gridId',
    component: CurricularGridManagePage,
    name: `${appName}.curricularGridDetail`,
  },
  {
    path: 'academicPrograms/:id/curricular-grids/:gridId/manage',
    component: CurricularGridManagePage,
    name: `${appName}.curricularGridManage`,
  },
];
