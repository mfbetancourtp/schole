import AcademicPeriodsPage from './pages/AcademicPeriods.vue';
import AcademicPeriodsListPage from './pages/AcademicPeriodsList.vue';
import AcademicPeriodDetailPage from './pages/AcademicPeriodDetail.vue';
import AcademicOfferPage from './pages/AcademicOffer.vue';
import SubjectAssignmentsPage from './pages/SubjectAssignments.vue';
import SpecialistsPage from './pages/Specialists.vue';
import SchedulePage from './pages/Schedule.vue';
import ActivitiesClassificationByLevelIdPage from './pages/ActivitiesClassificationByLevelId.vue';

import MenuImportAcademicPeriodPage from './pages/MenuImportAcademicPeriod.vue';
import ImportTemplateAcademicOfferPage from './pages/ImportTemplateAcademicOffer.vue';
import ImportCopyAcademicOfferPage from './pages/ImportCopyAcademicOffer.vue';
import ImportTemplateTeachersPage from './pages/ImportTemplateTeachers.vue';
import ImportTemplateStudentsPage from './pages/ImportTemplateStudents.vue';
import ImportTemplateSubjectAssignmentsPage from './pages/ImportTemplateSubjectAssignments.vue';
import ImportTemplateSubjectClasroomPage from './pages/ImportTemplateSubjectClasroom.vue';
import ImportCopyAcademicCargaPage from './pages/ImportCopyAcademicCarga.vue';
import ImportTemplateParentsPage from './pages/ImportTemplateParents.vue';
import ExtraordinaryGradePeriodsPage from './components/ExtraordinaryGradePeriods.vue';
import ImportTemplateAcademicPlanningAcademicOfferPage from './pages/ImportTemplateAcademicPlanningAcademicOffer.vue';
import ImportCopyTemplateSubjectClasroom from './pages/ImportCopyTemplateSubjectClasroom.vue';
import LoadManagementPage from './pages/LoadManagement.vue';
import LoadingRulesPage from './pages/LoadingRules.vue';
import TeacherBankPage from './pages/TeacherBank.vue';
import TimetableViewPage from './pages/TimetableViewPage.vue';

const appName = 'academicPlanning';

export const academicPlanningRouting = [
  {
    path: 'academic-periods',
    component: AcademicPeriodsPage,
    name: `${appName}.academicPeriods`,
  },
  {
    path: 'academic-periods-list',
    component: AcademicPeriodsListPage,
    name: `${appName}.academicPeriodsList`,
  },
  {
    path: 'academic-periods/:academicPeriodId/detail',
    component: AcademicPeriodDetailPage,
    name: `${appName}.academicPeriodsDetail`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period',
    component: MenuImportAcademicPeriodPage,
    name: `${appName}.menuImportAcademicPeriod`,
  },
  {
    path: 'academic-periods/:academicPeriodId/extraordinary-grade-periods/:periodId',
    component: ExtraordinaryGradePeriodsPage,
    name: `${appName}.extraordinaryGradePeriods`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-template-academic-offer',
    component: ImportTemplateAcademicOfferPage,
    name: `${appName}.importTemplateAcademicOffer`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-copy-academic-offer',
    component: ImportCopyAcademicOfferPage,
    name: `${appName}.importCopyAcademicOffer`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-template-teachers',
    component: ImportTemplateTeachersPage,
    name: `${appName}.importTemplateTeachers`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-template-students',
    component: ImportTemplateStudentsPage,
    name: `${appName}.importTemplateStudents`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-template-parents',
    component: ImportTemplateParentsPage,
    name: `${appName}.importTemplateParents`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-template-subject-assignments',
    component: ImportTemplateSubjectAssignmentsPage,
    name: `${appName}.importTemplateSubjectAssignments`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-template-subject-clasroom',
    component: ImportTemplateSubjectClasroomPage,
    name: `${appName}.importTemplateSubjectClasroom`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-copy-subject-clasroom',
    component: ImportCopyAcademicCargaPage,
    name: `${appName}.importCopyAcademicCarga`,
  },
  {
    path: 'academic-periods/:academicPeriodId/import-academic-period/import-copy-template-subjectClasroom',
    component: ImportCopyTemplateSubjectClasroom,
    name: `${appName}.importCopyTemplateSubjectClasroom`,
  },

  {
    path: 'academic-offer',
    component: AcademicOfferPage,
    name: `${appName}.academicOffer`,
  },
  {
    path: 'academic-offer/:academicPeriodGroupId/subject-assignments',
    component: SubjectAssignmentsPage,
    name: `${appName}.subjectAssignments`,
  },
  {
    path: 'academic-offer/import-template-academic-offer',
    component: ImportTemplateAcademicPlanningAcademicOfferPage,
    name: `${appName}.academicOffer.importTemplateAcademicOffer`,
  },
  {
    path: 'academic-offer/:academicPeriodGroupId/subject-assignments/:userId/schedule',
    component: SchedulePage,
    name: `${appName}.subjectAssignments.schedule`,
  },

  {
    path: 'specialists',
    component: SpecialistsPage,
    name: `${appName}.specialists`,
  },
  {
    path: 'academic-offer/:levelId/activities-classification-level/:validPercentLevel',
    component: ActivitiesClassificationByLevelIdPage,
    name: `${appName}.activitiesClassificationLevel`,
  },
  {
    path: 'loadManagement',
    component: LoadManagementPage,
    name: `${appName}.loadManagement`,
  },
  {
    path: 'loadManagement/timetable/:id',
    component: TimetableViewPage,
    name: `${appName}.timetableView`,
  },
  {
    path: 'loadingRules',
    component: LoadingRulesPage,
    name: `${appName}.loadingRules`,
  },
  {
    path: 'teacherBank',
    component: TeacherBankPage,
    name: `${appName}.teacherBank`,
  },
];
