import { RouteRecordRaw } from 'vue-router';

import CoursesPage from './pages/Courses.vue';
import attendancePage from './pages/Attendance.vue';
import CreateAttendancePage from './pages/CreateAttendance.vue';
import EditAttendancePage from './pages/EditAttendance.vue';
import AttendanceSummaryPage from './pages/AttendanceSummary.vue';
import AttendanceGeneralPage from './pages/AttendanceGeneral.vue';
import CreateAttendanceGeneralPage from './pages/CreateAttendanceGeneral.vue';
import EditAttendanceGeneralPage from './pages/EditAttendanceGeneral.vue';
import ActivitiesTeacherPage from './pages/ActivitiesTeacher.vue';
import ActivitiesClassificationPage from './pages/ActivitiesClassification.vue';
import CompetenciesPage from './pages/Competencies.vue';
import CreateCompetenciesTeacherPage from './pages/CreateCompetenciesTeacher.vue';
import EditCompetenciesTeacherPage from './pages/EditCompetenciesTeacher.vue';
import FollowUpToTopicsPage from './pages/FollowUpToTopics.vue';
import CreateActivitiesTeacherPage from './pages/CreateActivitiesTeacher.vue';
import EditActivitiesTeacherPage from './pages/EditActivitiesTeacher.vue';
import ActivitySummaryPage from './pages/ActivitySummaries.vue';
import QualifyActivityPage from './pages/QualifyActivity.vue';
import studentActivitiesPage from './pages/StudentActivities.vue';
import StudentsByParents from './pages/StudentsByParents.vue';
import StudentSchedulePage from './pages/StudentSchedule.vue';
import AttendaceTablePage from './pages/AttendanceTable.vue';
import HomeStudentPage from './pages/HomeStudent.vue';
import PlanningWeeksPage from './pages/PlanningWeeks.vue';
import CreatePlanningWeekPage from './pages/CreatePlanningWeek.vue';
import EditPlanningWeeksPage from './pages/EditPlanningWeeks.vue';

import CourseSchedulePage from './pages/CourseSchedule.vue';
import CourseScheduleCreatePage from './pages/CourseScheduleCreate.vue';
import CourseScheduleEditPage from './pages/CourseScheduleEdit.vue';
import CourseScheduleEnrolledPage from './pages/CourseScheduleEnrolled.vue';
import CourseScheduleNotesByPeriodPage from './pages/CourseScheduleNotesByPeriod.vue';
import CoursesFinalReportCardPage from './pages/CoursesFinalReportCard.vue';
import NewSlettersPage from './pages/NewSletters.vue';
import ObservationGeneralPage from './pages/ObservationGeneral.vue';
import DashboardStudent from './pages/DashboardStudent.vue';
import MyGrades from './pages/MyGrades.vue';
import NotesByPeriodForLevelingPage from './pages/NotesByPeriodForLeveling.vue';
import SchedulePage from './pages/Schedule.vue';
import MyProgressAcademicPage from './pages/MyProgressAcademic.vue';

const appName = 'administration';

export const administrationRouting: RouteRecordRaw[] = [
  // HOME TEACHER
  {
    path: 'home-teacher',
    component: CoursesPage,
    name: `${appName}.homeTeacher`,
  },
  {
    path: 'home-teacher/:courseId/final-report-card',
    component: CoursesFinalReportCardPage,
    name: `${appName}.homeTeacherFinalReportCard`,
  },
  // Attendance
  {
    path: 'home-teacher/:courseId/attendance',
    component: attendancePage,
    name: `${appName}.homeTeacher.attendance`,
  },
  {
    path: 'home-teacher/:courseId/attendance/create',
    component: CreateAttendancePage,
    name: `${appName}.homeTeacher.attendance.create`,
  },
  {
    path: 'home-teacher/:courseId/attendance/:sessionId/edit',
    component: EditAttendancePage,
    name: `${appName}.homeTeacher.attendance.edit`,
  },
  {
    path: 'home-teacher/:courseId/attendance/attendance-summary',
    component: AttendanceSummaryPage,
    name: `${appName}.homeTeacher.attendance.attendanceSummary`,
  },

  // Asistencia General
  {
    path: 'home-teacher/:courseId/attendance-general',
    component: AttendanceGeneralPage,
    name: `${appName}.homeTeacher.attendanceGeneral`,
  },

  {
    path: 'home-teacher/:courseId/attendance-general/create',
    component: CreateAttendanceGeneralPage,
    name: `${appName}.homeTeacher.attendanceGeneral.create`,
  },
  {
    path: 'home-teacher/:courseId/attendance-general/:sessionId/edit',
    component: EditAttendanceGeneralPage,
    name: `${appName}.homeTeacher.attendanceGeneral.edit`,
  },
  //General Observation
  {
    path: 'home-teacher/:courseId/observation-general/:academicPeriodGroupId',
    component: ObservationGeneralPage,
    name: `${appName}.homeTeacher.observationGeneral`,
  },

  // Activities
  {
    path: 'home-teacher/:courseId/activities',
    component: ActivitiesTeacherPage,
    name: `${appName}.homeTeacher.activities`,
  },
  {
    path: 'home-teacher/:courseId/activities/create',
    component: CreateActivitiesTeacherPage,
    name: `${appName}.homeTeacher.activities.create`,
  },
  {
    path: 'home-teacher/:courseId/activities/:activityId/edit',
    component: EditActivitiesTeacherPage,
    name: `${appName}.homeTeacher.activities.edit`,
  },
  {
    path: 'home-teacher/:courseId/activities/activity-summary',
    component: ActivitySummaryPage,
    name: `${appName}.homeTeacher.activities.activitySummary`,
  },
  {
    path: 'home-teacher/:courseId/activities/:activityId/qualify-activity',
    component: QualifyActivityPage,
    name: `${appName}.homeTeacher.activities.qualifyActivity`,
  },

  // Activities Classification
  {
    path: 'home-teacher/:courseId/activities-classification',
    component: ActivitiesClassificationPage,
    name: `${appName}.homeTeacher.activitiesClassification`,
  },

  // Competencies
  {
    path: 'home-teacher/:courseId/apg/:academicPeriodGroupId/competencies',
    component: CompetenciesPage,
    name: `${appName}.homeTeacher.competencies`,
  },
  {
    path: 'home-teacher/:courseId/apg/:academicPeriodGroupId/competencies/:curriculumSubjectId/create',
    component: CreateCompetenciesTeacherPage,
    name: `${appName}.homeTeacher.competencies.create`,
  },
  {
    path: 'home-teacher/:courseId/apg/:academicPeriodGroupId/competencies/:curriculumSubjectId/edit/:competenceId',
    component: EditCompetenciesTeacherPage,
    name: `${appName}.homeTeacher.competencies.edit`,
  },

  // follow Up To Topics
  {
    path: 'home-teacher/:courseId/follow-up-to-topics',
    component: FollowUpToTopicsPage,
    name: `${appName}.homeTeacher.followUpToTopics`,
  },
  // newsletters
  {
    path: 'home-teacher/:courseId/newSletters',
    component: NewSlettersPage,
    name: `${appName}.homeTeacher.newSletters`,
  },
  // STUDENTS
  {
    path: 'home-student',
    component: HomeStudentPage,
    name: `${appName}.homeStudent`,
  },
  {
    path: 'students',
    component: StudentsByParents,
    name: `${appName}.students`,
  },
  {
    path: 'student-activities',
    component: studentActivitiesPage,
    name: `${appName}.studentActivities`,
  },
  {
    path: 'student-schedule',
    component: StudentSchedulePage,
    name: `${appName}.studentSchedule`,
  },
  {
    path: 'student-attendance',
    component: AttendaceTablePage,
    name: `${appName}.studentAttendance`,
  },

  {
    path: 'home-teacher/:courseId/:academicPeriodGroupId/planning-weeks',
    component: PlanningWeeksPage,
    name: `${appName}.homeTeacherPlanningWeeks`,
  },
  {
    path: 'home-teacher/:academicPeriodGroupId/course/:courseId/planning-weeks/create',
    component: CreatePlanningWeekPage,
    name: `${appName}.homeTeacherPlanningWeeksCreate`,
  },
  {
    path: 'home-teacher/:academicPeriodGroupId/course/:courseId/planning-weeks/:planningWeekId/edit',
    component: EditPlanningWeeksPage,
    name: `${appName}.homeTeacherPlanningWeeksEdit`,
  },
  {
    path: 'home-student/:courseId/follow-up-to-topics',
    component: FollowUpToTopicsPage,
    name: `${appName}.homeStudent.followUpToTopics`,
  },
  {
    path: 'course-schedule',
    component: CourseSchedulePage,
    name: `${appName}.courseSchedule`,
  },
  {
    path: 'course-schedule/create',
    component: CourseScheduleCreatePage,
    name: `${appName}.courseScheduleCreate`,
  },
  {
    path: 'course-schedule/:courseId/edit',
    component: CourseScheduleEditPage,
    name: `${appName}.courseScheduleEdit`,
  },
  {
    path: 'course-schedule/:courseId/enrolled',
    component: CourseScheduleEnrolledPage,
    name: `${appName}.courseScheduleEnrolled`,
  },
  {
    path: 'course-schedule/:courseId/notes-by-period',
    component: CourseScheduleNotesByPeriodPage,
    name: `${appName}.courseScheduleNotesByPeriod`,
  },
  // dashboar student
  {
    path: '/administration/dashboardStudent',
    component: DashboardStudent,
    name: `${appName}.dashboardStudent`,
  },
  // mis calificaciones
  {
    path: '/administration/gradesStudent',
    component: MyGrades,
    name: `${appName}.gradesStudent`,
  },
  // mi progreso academico
  {
    path: '/administration/progressAcademic',
    component: MyProgressAcademicPage,
    name: `${appName}.progressAcademic`,
  },
  // NIVELACIONES
  {
    path: 'home-teacher/leveling/:courseId/:subjectAssignmentId',
    component: NotesByPeriodForLevelingPage,
    name: `${appName}.homeTeacher.leveling`,
  },

  {
    path: 'schedule',
    component: SchedulePage,
    name: `${appName}.schedule`,
  },
];
