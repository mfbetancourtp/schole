import AnalysisStatisticsPage from './pages/AnalysisStatistics.vue';
import SurveyManagementPage from './pages/SurveyManagement.vue';
import ApplicationAssessmentsPage from './pages/ApplicationAssessments.vue';
import TeacherDetailPage from './pages/TeacherDetail.vue';
import AssessmentScalesPage from './pages/AssessmentScales.vue';
import AssessmentScaleFormPage from './components/AssessmentScaleForm.vue';
import MyEvaluationPage from './pages/MyEvaluation.vue';
import EvaluationExecutionPage from './pages/EvaluationExecution.vue';

const appName = 'evaluation-teacher';

export const evaluationTeacherRouting = [
  {
    path: 'survey-management',
    component: SurveyManagementPage,
    name: `${appName}.SurveyManagement`,
  },
  {
    path: 'application-assessments',
    component: ApplicationAssessmentsPage,
    name: `${appName}.ApplicationAssessments`,
  },
  {
    path: 'analysis-statistics',
    component: AnalysisStatisticsPage,
    name: `${appName}.AnalysisStatistics`,
  },
  {
    path: 'teacher-detail',
    component: TeacherDetailPage,
    name: `${appName}.TeacherDetail`,
  },
  {
    path: 'assessment-scales',
    component: AssessmentScalesPage,
    name: `${appName}.AssessmentScales`,
  },
  {
    path: 'assessment-scales/new',
    component: AssessmentScaleFormPage,
    name: `${appName}.AssessmentScaleNew`,
  },
  {
    path: 'assessment-scales/:id',
    component: AssessmentScaleFormPage,
    name: `${appName}.AssessmentScaleEdit`,
  },
  {
    path: 'my-evaluations',
    component: MyEvaluationPage,
    name: `${appName}.MyEvaluations`,
  },
  {
    path: 'my-evaluations/:assignmentId/execute',
    component: EvaluationExecutionPage,
    name: `${appName}.EvaluationExecution`,
  },
];
