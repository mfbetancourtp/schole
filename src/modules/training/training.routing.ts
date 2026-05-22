import BudgetTrackingPage from './pages/BudgetTracking.vue';
import CourseSchedulePage from './pages/CourseSchedule.vue';
import CourseScheduleCreatePage from './pages/CourseScheduleCreate.vue';
import CourseScheduleEditPage from './pages/CourseScheduleEdit.vue';
import CourseScheduleEnrolledPage from './pages/CourseScheduleEnrolled.vue';
import courseScheduleTravelExpensesPage from './pages/CourseScheduleTravelExpenses.vue';
import CourseSchedulePlanningWeeksPage from './pages/CourseSchedulePlanningWeeks.vue';
import CourseSchedulePlanningWeeksCreatePage from './pages/CourseSchedulePlanningWeeksCreate.vue';
import CourseSchedulePlanningWeeksEditPage from './pages/CourseSchedulePlanningWeeksEdit.vue';
import CourseTrackingPage from './pages/CourseTracking.vue';
import courseScheduleEmployeePage from './pages/CourseScheduleEmployee.vue';
import executionOfCoursesPage from './pages/ExecutionOfCourses.vue';
import executionOfCoursesAttendancePage from '../administration/pages/Attendance.vue';
import executionOfCoursesAttendanceCreatePage from '../administration/pages/CreateAttendance.vue';
import executionOfCoursesAttendanceEditPage from '../administration/pages/EditAttendance.vue';
import executionOfCoursesAttendanceSummaryPage from '../administration/pages/AttendanceSummary.vue';
import executionOfCoursesActivitiesPage from '../administration/pages/ActivitiesTeacher.vue';
import executionOfCoursesActivitiesCreatePage from '../administration/pages/CreateActivitiesTeacher.vue';
import executionOfCoursesActivitiesEditPage from '../administration/pages/EditActivitiesTeacher.vue';
import executionOfCoursesActivitiesSummaryPage from '../administration/pages/ActivitySummaries.vue';
import executionOfCoursesActivitiesQualifyPage from '../administration/pages/QualifyActivity.vue';
import SessionsTrackingPage from '../training/pages/SessionsTracking.vue';
import TravelExpensesTrackingPage from '../training/pages/TravelExpensesTracking.vue';

const appName = 'training';

export const trainingRouting = [
  {
    path: 'budget-tracking/:courseId',
    component: BudgetTrackingPage,
    name: `${appName}.budgetTracking`,
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
    path: 'course-schedule/:courseId/travel-expenses',
    component: courseScheduleTravelExpensesPage,
    name: `${appName}.courseScheduleTravelExpenses`,
  },
  {
    path: 'course-schedule/:courseId/planning-weeks',
    component: CourseSchedulePlanningWeeksPage,
    name: `${appName}.courseSchedulePlanningWeeks`,
  },
  {
    path: 'course-schedule/:courseId/planning-weeks/create',
    component: CourseSchedulePlanningWeeksCreatePage,
    name: `${appName}.courseSchedulePlanningWeeksCreate`,
  },
  {
    path: 'course-schedule/:courseId/planning-weeks/:planningWeekId/edit',
    component: CourseSchedulePlanningWeeksEditPage,
    name: `${appName}.courseSchedulePlanningWeeksEdit`,
  },

  {
    path: 'course-schedule-employee',
    component: courseScheduleEmployeePage,
    name: `${appName}.courseScheduleEmployee`,
  },

  {
    path: 'course-tracking/',
    component: CourseTrackingPage,
    name: `${appName}.courseTracking`,
  },

  {
    path: 'execution-of-courses',
    component: executionOfCoursesPage,
    name: `${appName}.executionOfCourses`,
  },
  {
    path: 'execution-of-courses/:courseId/attendance',
    component: executionOfCoursesAttendancePage,
    name: `${appName}.executionOfCoursesAttendance`,
  },
  {
    path: 'execution-of-courses/:courseId/attendance/create',
    component: executionOfCoursesAttendanceCreatePage,
    name: `${appName}.executionOfCoursesAttendanceCreate`,
  },
  {
    path: 'execution-of-courses/:courseId/attendance/:sessionId/edit',
    component: executionOfCoursesAttendanceEditPage,
    name: `${appName}.executionOfCoursesAttendanceEdit`,
  },
  {
    path: 'execution-of-courses/:courseId/attendance/attendance-summary',
    component: executionOfCoursesAttendanceSummaryPage,
    name: `${appName}.executionOfCoursesAttendanceAttendanceSummary`,
  },
  {
    path: 'execution-of-courses/:courseId/activities',
    component: executionOfCoursesActivitiesPage,
    name: `${appName}.executionOfCoursesActivities`,
  },
  {
    path: 'execution-of-courses/:courseId/activities/create',
    component: executionOfCoursesActivitiesCreatePage,
    name: `${appName}.executionOfCoursesActivitiesCreate`,
  },
  {
    path: 'execution-of-courses/:courseId/activities/:activityId/edit',
    component: executionOfCoursesActivitiesEditPage,
    name: `${appName}.executionOfCoursesActivitiesEdit`,
  },
  {
    path: 'execution-of-courses/:courseId/activities/activity-summary',
    component: executionOfCoursesActivitiesSummaryPage,
    name: `${appName}.executionOfCoursesActivitiesSummary`,
  },
  {
    path: 'execution-of-courses/:courseId/activities/:activityId/qualify-activity',
    component: executionOfCoursesActivitiesQualifyPage,
    name: `${appName}.executionOfCoursesActivitiesQualify`,
  },
  {
    path: 'sessions-tracking/:courseId',
    component: SessionsTrackingPage,
    name: `${appName}.sessionsTracking`,
  },
  {
    path: 'travel-expenses-tracking/:courseId',
    component: TravelExpensesTrackingPage,
    name: `${appName}.travelExpensesTracking`,
  },
];
