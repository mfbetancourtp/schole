import * as VueRouter from 'vue-router';
import { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

import AppLayout from './shared/layout/AppLayout.vue';
import AppEmptyLayout from './shared/layout/AppEmptyLayout.vue';

import { authGuard } from './shared/guards/auth.guard';
import { evaluationGuard } from './shared/guards/evaluation.guard';
import { initDataResolver } from './shared/resolvers/initData.resolver';
import { ErrorAlertService } from './shared/services/errorAlert.service';

import { authRouting } from './modules/auth/auth.routing';
import { adminRouting } from './modules/admin/admin.routing';
import { academicAdministrationRouting } from './modules/academicAdministration/academic-administration.routing';
import { casuridRouting } from './modules/casurid/casurid.routing';
import { accessRouting } from './modules/access/access.routing';
import { ltiRouting } from './modules/ltiProvider/lti.routing';
import { academicProgramsRouting } from './modules/academicPrograms/academicPrograms.routing';
import { institutionalConfigurationRouting } from './modules/institutionalConfiguration/institutionalConfiguration.routing';
import { surveysRouting } from './modules/surveys/surveys.routing';
import { academicPlanningRouting } from './modules/academicPlanning/academic-planning.routing';
import { reportsRouting } from './modules/reports/reports.routing';
import { reportsStudentRouting } from './modules/reportsStudent/reportsStudent.routing';
import { administrationRouting } from './modules/administration/administration.routing';
import { disciplinaryControlRouting } from './modules/disciplinaryControl/disciplinaryControl.routing';
import { communicationsRouting } from './modules/communications/communications.routing';
import { collectionsRouting } from './modules/collections/collections.routing';
// import { eventsRouting } from './modules/events/events.routing';
import { publicModuleRouting } from './modules/publicModule/publicModule.routing';
import { competenceEvaluationRouting } from './modules/competenceEvaluation/competenceEvaluation.routing';
import { trainingRouting } from './modules/training/training.routing';
import { companyRouting } from './modules/company/company.routing';
import { budgetRouting } from './modules/budget/budget.routing';
import { superAdminRouting } from './modules/superAdmin/superAdmin.routing';
import { organizationalRouting } from './modules/organizational/organizational.routing';
import { institutionalEventsRouting } from './modules/institutionalEvents/institutionalEvents.routing';
// import { redirectGuard } from './shared/guards/redirect.guard';
import { evaluationTeacherRouting } from './modules/evaluationTeacher/evaluationTeacher.routing';
import { certificatesRouting } from './modules/certificates/certificates.routing';

import { teachingManagementRouting } from './modules/teachingManagement/teachingManagement.routing';
import { curriculumDesignRouting } from './modules/curriculumDesign/curriculumDesign.routing';
import { resumeRouting } from './modules/resume/resume.routing';
import { physicalResourcesRouting } from './modules/physicalResources/physicalResources.routing';
import { studentWeldareRouting } from './modules/studentWeldare/studentWeldare.routing';
import { institutionalAgreementsRouting } from './modules/institutionalAgreements/institutionalAgreements.routing';
import { smartClassroomRouting } from './modules/smartClassroom/smartClassroom.routing';
import { requestManagementRouting } from './modules/requestManagement/requestManagement.routing';
import { graduatesRouting } from './modules/graduates/graduates.routing';
import { institutionalWellnessRouting } from './modules/institutionalWellness/institutionalWellness.routing';

const appRouting: RouteRecordRaw[] = [
  // {
  //   path: '/',
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   redirect: (to) => {
  //     return {
  //       path: '/admin/home',
  //     };
  //   },
  // },
  {
    path: '/',
    component: AppEmptyLayout,
    beforeEnter: [initDataResolver],
    children: [
      // Main Redirection
      // {
      //   path: '',
      //   beforeEnter: [redirectGuard],
      //   redirect: '/admin/home',
      // },
      // Casurid Module
      {
        path: '/institution/casurid',
        component: AppEmptyLayout,
        children: casuridRouting,
      },

      // Auth Module
      {
        path: '/auth',
        component: AppEmptyLayout,
        children: authRouting,
      },

      // Admin Module
      {
        path: '/admin',
        component: AppLayout,
        children: adminRouting,
      },

      // Auth Module
      {
        path: '/academic-administration',
        component: AppLayout,
        children: academicAdministrationRouting,
      },

      // Access Module
      {
        path: '/access',
        component: AppLayout,
        children: accessRouting,
        beforeEnter: [authGuard],
      },

      // Auth Module
      {
        path: '/lti',
        component: AppEmptyLayout,
        children: ltiRouting,
      },

      // Academic Programs
      {
        path: '/academic-programs',
        component: AppLayout,
        children: academicProgramsRouting,
        beforeEnter: [authGuard],
      },

      // Institutional Configuration
      {
        path: '/institutional-configuration',
        component: AppLayout,
        children: institutionalConfigurationRouting,
        beforeEnter: [authGuard],
      },

      // Academic Planning
      {
        path: '/academic-planning',
        component: AppLayout,
        children: academicPlanningRouting,
        beforeEnter: [authGuard],
      },

      // Surveys
      {
        path: '/surveys',
        component: AppEmptyLayout,
        children: surveysRouting,
      },

      // Reports
      {
        path: '/reports',
        component: AppLayout,
        children: reportsRouting,
        beforeEnter: [authGuard],
      },
      // Reports
      {
        path: '/reportsStudent',
        component: AppLayout,
        children: reportsStudentRouting,
        beforeEnter: [authGuard],
      },
      // Administration
      {
        path: '/administration',
        component: AppLayout,
        children: administrationRouting,
        beforeEnter: [authGuard],
      },

      // Disciplinary Control
      {
        path: '/disciplinary-control',
        component: AppLayout,
        children: disciplinaryControlRouting,
        beforeEnter: [authGuard],
      },

      // Communications
      {
        path: '/communications',
        component: AppLayout,
        children: communicationsRouting,
        beforeEnter: [authGuard],
      },

      // Collections
      {
        path: '/collections',
        component: AppLayout,
        children: collectionsRouting,
        beforeEnter: [authGuard],
      },

      // Events
      {
        path: '/events',
        component: AppLayout,
        children: institutionalEventsRouting,
        beforeEnter: [authGuard],
      },

      // Organizational
      {
        path: '/organizational',
        component: AppLayout,
        children: organizationalRouting,
        beforeEnter: [authGuard],
      },

      // Public Module
      {
        path: '/public',
        component: AppEmptyLayout,
        children: publicModuleRouting,
      },

      // Competence Evaluation
      {
        path: '/competence-evaluation',
        component: AppLayout,
        children: competenceEvaluationRouting,
        beforeEnter: [authGuard],
      },

      // Training
      {
        path: '/training',
        component: AppLayout,
        children: trainingRouting,
        beforeEnter: [authGuard],
      },

      // Company
      {
        path: '/company',
        component: AppLayout,
        children: companyRouting,
        beforeEnter: [authGuard],
      },

      // Budgets
      {
        path: '/budget',
        component: AppLayout,
        children: budgetRouting,
        beforeEnter: [authGuard],
      },

      // Super Admin
      {
        path: '/super-admin',
        component: AppLayout,
        children: superAdminRouting,
        beforeEnter: [authGuard],
      },
      // Super Admin
      {
        path: '/evaluation-teacher',
        component: AppLayout,
        children: evaluationTeacherRouting,
        beforeEnter: [authGuard],
      },
      // Certificates
      {
        path: '/certificates',
        component: AppLayout,
        children: certificatesRouting,
        beforeEnter: [authGuard],
      },
      // Teaching Management
      {
        path: '/teachingManagement',
        component: AppLayout,
        children: teachingManagementRouting,
        beforeEnter: [authGuard],
      },
      // Curriculum Design
      {
        path: '/curriculumDesign',
        component: AppLayout,
        children: curriculumDesignRouting,
        beforeEnter: [authGuard],
      },
      // resume
      {
        path: '/resume',
        component: AppLayout,
        children: resumeRouting,
        beforeEnter: [authGuard],
      },

      // Physical Resources
      {
        path: '/physical-resources',
        component: AppLayout,
        children: physicalResourcesRouting,
        beforeEnter: [authGuard],
      },

      // Student Weldare
      {
        path: '/studentWeldare',
        component: AppLayout,
        children: studentWeldareRouting,
      },
      // Convenios Institucionales
      {
        path: '/institutional-agreements',
        component: AppLayout,
        children: institutionalAgreementsRouting,
        beforeEnter: [authGuard],
      },
      // Smart Classroom
      {
        path: '/smart-classroom',
        component: AppLayout,
        children: smartClassroomRouting,
        beforeEnter: [authGuard],
      },
      // Request Management
      {
        path: '/request-management',
        component: AppLayout,
        children: requestManagementRouting,
        beforeEnter: [authGuard],
      },
      // Graduates
      {
        path: '/graduates',
        component: AppLayout,
        children: graduatesRouting,
        beforeEnter: [authGuard],
      },
      // Institutional Wellness
      {
        path: '/institutional-welfare',
        component: AppLayout,
        children: institutionalWellnessRouting,
        beforeEnter: [authGuard],
      },
    ],
  },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes: appRouting,
});
const errorAlertService = new ErrorAlertService();

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  errorAlertService.hide();
  next();
});

router.beforeEach(evaluationGuard);

export { router };
