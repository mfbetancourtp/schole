import formsPage from './pages/FormsPage.vue';
import configureEvaluationsPage from './pages/ConfigureEvaluations.vue';
import evaluationListPage from './pages/EvaluationList.vue';
import resultsAnalysisPage from './pages/ResultsAnalysis.vue';
import evaluatePage from './pages/EvaluatePage.vue';
import myResultsPage from './pages/MyResults.vue';
import createConfigureEvaluationPage from './pages/CreateConfigureEvaluation.vue';
import editConfigureEvaluationPage from './pages/EditConfigureEvaluation.vue';
import specifyEvaluatorsPage from './pages/SpecifyEvaluators.vue';

const appName = 'competenceEvaluation';

export const competenceEvaluationRouting = [
  {
    path: 'forms',
    component: formsPage,
    name: `${appName}.forms`,
  },

  {
    path: 'configure-evaluations',
    component: configureEvaluationsPage,
    name: `${appName}.configureEvaluations`,
  },
  {
    path: 'configure-evaluations/create',
    component: createConfigureEvaluationPage,
    name: `${appName}.configureEvaluationsCreate`,
  },
  {
    path: 'configure-evaluations/:corporateEvaluationPeriodId/edit',
    component: editConfigureEvaluationPage,
    name: `${appName}.configureEvaluationsEdit`,
  },
  {
    path: 'configure-evaluations/:corporateEvaluationPeriodId/edit/specify-evaluators',
    component: specifyEvaluatorsPage,
    name: `${appName}.specifyEvaluators`,
  },

  {
    path: 'evaluation-list',
    component: evaluationListPage,
    name: `${appName}.evaluationList`,
  },

  {
    path: 'results-analysis',
    component: resultsAnalysisPage,
    name: `${appName}.resultsAnalysis`,
  },

  {
    path: 'evaluate',
    component: evaluatePage,
    name: `${appName}.evaluate`,
  },

  {
    path: 'my-results',
    component: myResultsPage,
    name: `${appName}.myResults`,
  },
];
