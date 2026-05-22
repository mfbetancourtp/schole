import Format from './pages/Format.vue';
import ProgramTypesPage from './pages/ProgramTypesPage.vue';
import ProgramTypeStructure from './pages/ProgramTypeStructure.vue';
import OperationalSchemeStructure from './pages/OperationalSchemeStructure.vue';
import AcademicProgramsPage from '../curriculumDesign/pages/AcademicPrograms.vue';
import LevelTypeVersionsPage from './pages/LevelTypeVersions.vue';
import OperationalSchemePage from './pages/OperationalScheme.vue';
import AcademicPeriodsPage from './pages/AcademicPeriods.vue';

const appName = 'curriculumDesign';

export const curriculumDesignRouting = [
  // Listado principal de formatos
  {
    path: 'format',
    component: Format,
    name: `${appName}.format`,
  },
  // Tipos de Programas Académicos (Niveles)
  {
    path: 'programType',
    component: ProgramTypesPage,
    name: `${appName}.programType`,
  },
  // Tipos de Programas Académicos ESQUEMA OPERATIVO
  {
    path: 'level-type-versions/:programTypeId',
    component: LevelTypeVersionsPage,
    name: `${appName}.levelTypeVersions`,
  },
  // Tipos de Programas Académicos ESTRUCTURA ASOCIACIONDE PERIODOS

  {
    path: 'academic-periods/:operationalSchemeId/:programTypeId',
    component: AcademicPeriodsPage,
    name: `${appName}.academicPeriods`,
  },
  // Tipos de Programas Académicos ESQUEMA OPERATIVO

  {
    path: 'operational-scheme/:operationalSchemeId/:programTypeId',
    component: OperationalSchemePage,
    name: `${appName}.operationalScheme`,
  },
  // Estructura de Tipo de Programa Académico
  {
    path: 'programType/:id/structure',
    component: ProgramTypeStructure,
    name: 'programTypeStructure',
  },
  // Estructura del Esquema Operativo
  {
    path: 'programType/:id/structure/:schemeId',
    component: OperationalSchemeStructure,
    name: 'operationalSchemeStructure',
  },
  {
    path: 'academicPrograms',
    component: AcademicProgramsPage,
    name: `${appName}.academicPrograms`,
  },
];
