import { RouteRecordRaw } from 'vue-router';
import { authGuard } from '../../shared/guards/auth.guard';

import CourseAdministrationPage from './pages/CourseAdministration.vue';
import EnrollStudentPage from './pages/EnrollStudent.vue';
import EditMatriculatePage from './pages/EditMatriculate.vue';
import CreateMatriculateParentsFromAdminPage from './pages/CreateMatriculateParentsFromAdmin.vue';
import EditMatriculateParentsFromAdminPage from './pages/EditMatriculateParentsFromAdmin.vue';
import EnrolledByCoursePage from './pages/EnrolledByCourse.vue';
import CreateMatriculateFromAdminPage from './pages/CreateMatriculateFromAdmin.vue';
import NotesByStudentPage from './pages/NotesByStudent.vue';
import TransferStudentPage from './pages/TransferStudent.vue';
import GroupPromotionsPage from './pages/GroupPromotions.vue';
import SubjectsByCoursePage from './pages/SubjectsByCourse.vue';
import NotesByPeriodPage from './pages/NotesByPeriod.vue';
import ImportTemplateNotesPage from './pages/ImportTemplateNotes.vue';
import ListMatriculatePage from './pages/ListMatriculate.vue';

import DetailMatriculatePage from './pages/DetailMatriculate.vue';
import DetailMatriculateParentCreatePage from './pages/DetailMatriculateParentCreate.vue';
import DetailMatriculateParentEditPage from './pages/DetailMatriculateParentEdit.vue';

const appName = 'academicAdministration';

export const academicAdministrationRouting: RouteRecordRaw[] = [
  {
    path: 'course-administration',
    component: CourseAdministrationPage,
    beforeEnter: [authGuard],
    name: `${appName}.courseAdministration`,
  },
  {
    path: 'course-administration/:curriculumOfferingId/matriculates',
    component: EnrolledByCoursePage,
    beforeEnter: [authGuard],
    name: `${appName}.enrolledByCourse`,
  },
  {
    path: 'course-administration/:academicPeriodGroupId/matriculates/create',
    component: CreateMatriculateFromAdminPage,
    beforeEnter: [authGuard],
    name: `${appName}.createMatriculateFromAdmin`,
  },
  {
    path: 'course-administration/:academicPeriodGroupId/matriculates/:matriculateId/edit',
    component: EditMatriculatePage,
    beforeEnter: [authGuard],
    name: `${appName}.editMatriculate`,
  },
  {
    path: 'course-administration/:academicPeriodGroupId/matriculates/:matriculateId/parents/create',
    component: CreateMatriculateParentsFromAdminPage,
    beforeEnter: [authGuard],
    name: `${appName}.createMatriculateParents`,
  },
  {
    path: 'course-administration/:academicPeriodGroupId/matriculates/:matriculateParentId/parents/edit',
    component: EditMatriculateParentsFromAdminPage,
    beforeEnter: [authGuard],
    name: `${appName}.editMatriculateParents`,
  },
  {
    path: 'course-administration/matriculates/:matriculateId/notes',
    component: NotesByStudentPage,
    beforeEnter: [authGuard],
    name: `${appName}.notesByStudent`,
  },
  {
    path: 'course-administration/:academicPeriodGroupId/matriculates/transfer-student/:enrollmentId',
    component: TransferStudentPage,
    beforeEnter: [authGuard],
    name: `${appName}.transferStudent`,
  },
  {
    path: 'course-administration/group-promotions/:academicPeriodGroupId',
    component: GroupPromotionsPage,
    beforeEnter: [authGuard],
    name: `${appName}.groupPromotions`,
  },
  {
    path: 'course-administration/subject-assignments/:academicPeriodGroupId/course',
    component: SubjectsByCoursePage,
    beforeEnter: [authGuard],
    name: `${appName}.subjectsByCourse`,
  },
  {
    path: 'course-administration/subject-assignments/:academicPeriodGroupId/course/:subjectAssignmentId/notes',
    component: NotesByPeriodPage,
    beforeEnter: [authGuard],
    name: `${appName}.notesByPeriod`,
  },
  {
    path: 'course-administration/:academicPeriodGroupId/import-template-notes',
    component: ImportTemplateNotesPage,
    beforeEnter: [authGuard],
    name: `${appName}.importTemplateNotes`,
  },

  {
    path: 'enroll-student',
    component: EnrollStudentPage,
    beforeEnter: [authGuard],
    name: `${appName}.enrollStudent`,
  },

  {
    path: 'detail-matriculate/:userId',
    component: DetailMatriculatePage,
    beforeEnter: [authGuard],
    name: `${appName}.detailMatriculate`,
  },
  {
    path: 'detail-matriculate/:userId/matriculate/:matriculateId/parent/create',
    component: DetailMatriculateParentCreatePage,
    beforeEnter: [authGuard],
    name: `${appName}.detailMatriculateParentCreate`,
  },
  {
    path: 'detail-matriculate/:userId/matriculate/:matriculateId/parent/:parentId/edit',
    component: DetailMatriculateParentEditPage,
    beforeEnter: [authGuard],
    name: `${appName}.detailMatriculateParentEdit`,
  },
  {
    path: 'course-administration/subject-assignments/:academicPeriodGroupId/course/:subjectAssignmentId/list',
    component: ListMatriculatePage,
    beforeEnter: [authGuard],
    name: `${appName}.listMatriculate`,
  },
];
