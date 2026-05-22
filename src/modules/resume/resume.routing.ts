import ConfigurationGeneralPage from './pages/ConfigurationGeneral.vue';
import TeacherResumePage from './pages/TeacherResume.vue';
import AssessmentModelsPage from './pages/AssessmentModels.vue';
import AssessmentCriterialPage from './components/assessmentModels/AssessmentCriterial.vue';
import AssessmentResultsPage from './components/assessmentModels/AssessmentResults.vue';
import TeacherRankingPage from './pages/TeacherRanking.vue';
import AttachmentValidationPage from './pages/AttachmentValidation.vue';
import AttachmentValidationReviewPage from './pages/AttachmentValidationReview.vue';
import TeacherEvaluationScalePage from './pages/TeacherEvaluationScale.vue';
import CreateTeacherEvaluationScalePage from './pages/CreateTeacherEvaluationScale.vue';
import EditTeacherEvaluationScalePage from './pages/EditTeacherEvaluationScale.vue';
const appName = 'resume';

export const resumeRouting = [
  //configuracion general
  {
    path: 'configurationGeneral',
    component: ConfigurationGeneralPage,
    name: `${appName}.configurationGeneral`,
  },
  // Hoja de vida docente
  {
    path: 'teacherResume',
    component: TeacherResumePage,
    name: `${appName}.teacherResume`,
  },
  //modelos de evaluacion
  {
    path: 'assessmentModels',
    component: AssessmentModelsPage,
    name: `${appName}.assessmentModels`,
  },
  //modelos de evaluacion criterios

  {
    path: 'assessmentCriterial',
    component: AssessmentCriterialPage,
    name: `${appName}.assessmentCriterial`,
  },
  //modelos de evaluacion ver resultados

  {
    path: 'assessmentResults',
    component: AssessmentResultsPage,
    name: `${appName}.assessmentResults`,
  },

  //ranking docentes
  {
    path: 'teacherRanking',
    component: TeacherRankingPage,
    name: `${appName}.teacherRanking`,
  },
  //Validacion de adjuntos
  {
    path: 'attachmentvalidation',
    component: AttachmentValidationPage,
    name: `${appName}.attachmentvalidation`,
  },
  {
    path: 'attachmentvalidation/review/:peopleId',
    component: AttachmentValidationReviewPage,
    name: `${appName}.attachmentvalidationReview`,
  },
  //Escala de evaluacioin docente
  {
    path: 'teacherEvaluationScale',
    component: TeacherEvaluationScalePage,
    name: `${appName}.teacherEvaluationScale`,
  },
  //Escala de evaluacioin docente form
  {
    path: 'teacherEvaluationScale/create',
    component: CreateTeacherEvaluationScalePage,
    name: `${appName}.teacherEvaluationScaleCreate`,
  },
  {
    path: 'teacherEvaluationScale/:teacherEvaluationScaleId/edit',
    component: EditTeacherEvaluationScalePage,
    name: `${appName}.teacherEvaluationScaleEdit`,
  },
];
