import AreasSubjectsPage from './pages/AreasSubjects.vue';
import LevelsDegreesPage from './pages/LevelsDegrees.vue';

import StudyPlanPage from './pages/StudyPlan.vue';
import SubjectsStudyPlan from './pages/SubjectsStudyPlan.vue';
import StudyPlanImportCurriculumsPage from './pages/StudyPlanImportCurriculums.vue';

import RatingScalesPage from './pages/RatingScales.vue';
import CreateRatingScalePage from './pages/CreateRatingScale.vue';
import EditRatingScalePage from './pages/EditRatingScale.vue';

import ProgramsViewPage from './pages/programs/ProgramsView.vue';
import ProgramCreatePage from './pages/programs/ProgramsCreate.vue';
import ProgramsCreate2Page from './pages/programs/ProgramsCreate2.vue';
import ProgramsEditPage from './pages/programs/ProgramsEdit.vue';
import DegreeCreatePage from './pages/programs/DegreeCreate.vue';

const appName = 'academicPrograms';

export const academicProgramsRouting = [
  {
    path: 'areas-subjects',
    component: AreasSubjectsPage,
  },
  {
    path: 'levels-degrees',
    component: LevelsDegreesPage,
  },
  {
    path: 'study-plan',
    component: StudyPlanPage,
    name: `${appName}.studyPlan`,
  },
  {
    path: 'study-plan/import-curriculums',
    component: StudyPlanImportCurriculumsPage,
    name: `${appName}.studyPlanImportCurriculums`,
  },
  {
    path: 'study-plan/:studyPlanId/subjects',
    component: SubjectsStudyPlan,
    name: `${appName}.subjectsStudyPlan`,
  },

  {
    path: 'rating-scales',
    component: RatingScalesPage,
    name: `${appName}.ratingScales`,
  },
  {
    path: 'rating-scales/create',
    component: CreateRatingScalePage,
    name: `${appName}.ratingScaleCreate`,
  },
  {
    path: 'rating-scales/:ratingScaleId/edit',
    component: EditRatingScalePage,
    name: `${appName}.ratingScaleEdit`,
  },
  {
    path: 'programs-view',
    component: ProgramsViewPage,
    name: `${appName}.programView`,
  },
  {
    path: 'programs-create',
    component: ProgramCreatePage,
    name: `${appName}.programCreate`,
  },
  {
    path: 'programs-create/:programsId/edit',
    component: ProgramsEditPage,
    name: `${appName}.programEdit`,
  },
  {
    path: 'degrees-create/levelId/:levelId',
    component: DegreeCreatePage,
    name: `${appName}.degreesCreate`,
  },
  {
    path: 'programs-create2/levelId/:levelId',
    component: ProgramsCreate2Page,
    name: `${appName}.programCreate2`,
  },
];
