import ReportListPage from './pages/ReportList.vue';
import AttendancePage from './pages/Attendance.vue';
import DegreeSummaryPage from './pages/DegreeSummary.vue';
import PeriodSummaryByGroupPage from './pages/PeriodSummaryByGroup.vue';
import PeriodSummaryGroupNewPage from './pages/PeriodSummaryGroupNew.vue';

import TutorWithStudentsPage from './pages/TutorWithStudents.vue';
import TutorWithStudentsNewPage from './pages/TutorWithStudentsNew.vue';

import StudentsByLevelPage from './pages/StudentsByLevel.vue';
import DailyAttendanceByGroupPage from './pages/DailyAttendanceByGroup.vue';
import AttendanceRecordControlPage from './pages/AttendanceRecordControl.vue';
import AnnouncementsReceptionPage from './pages/AnnouncementsReception.vue';
import NotificationsReceptionPage from './pages/NotificationsReception.vue';
import DisciplinaryRecordPage from './pages/DisciplinaryRecord.vue';
import StatusActivitiesPage from './pages/StatusActivities.vue';
import TutorListPage from './pages/TutorList.vue';
import TeachersByLevelPage from './pages/TeachersByLevel.vue';
import DegreeSummaryQuickViewPage from './pages/DegreeSummaryQuickView.vue';
import SummaryTeacherQuickViewPage from './pages/SummaryTeacherQuickView.vue';
import StudentPerformanceByGroupPage from './pages/StudentPerformanceByGroup.vue';
import PerformancePerPeriodPage from './pages/PerformancePerPeriod.vue';
import StudentPerformancePage from './pages/StudentPerformance.vue';
import StudentDisciplinarySummaryPage from './pages/StudentDisciplinarySummary.vue';
import SummaryAveragesByGradesPage from './pages/SummaryAveragesByGrades.vue';
import PerformanceByStudentPage from './pages/PerformanceByStudent.vue';
import SummaryOfAveragesByGroupPage from './pages/SummaryOfAveragesByGroup.vue';
import ReportCardPage from './pages/ReportCard.vue';
import SubjectPerformanceByGradePage from './pages/SubjectPerformanceByGrade.vue';
import PeriodSummaryByTeacherPage from './pages/PeriodSummaryByTeacher.vue';
import StudentInformationPage from './pages/StudentInformation.vue';
import MedicalRecordsByStudentPage from './pages/MedicalRecordsByStudent.vue';
import PerformanceStatisticsPerLevel from './pages/PerformanceStatisticsPerLevel.vue';
import PerformanceStatisticsByGroupPage from './pages/PerformanceStatisticsByGroup.vue';
import SummaryAveragesHalfUnitPage from './pages/SummaryAveragesHalfUnit.vue';
import DisabledStudentsReportCardPage from './pages/DisabledStudentsReportCard.vue';
import AverageOverallPerWeekPage from './pages/AverageOverallPerWeek.vue';
import CertificateMatriculateByUserPage from './pages/CertificateMatriculateByUser.vue';
import ConstancyMatriculateByUserPage from './pages/ConstancyMatriculateByUser.vue';
import BlockedStudentsPage from './pages/BlockedStudents.vue';
import MassiveLoadEducationMinistriesPage from './pages/MassiveLoadEducationMinistries.vue';
import EducationMinistriesPage from './pages/EducationMinistries.vue';
import PeaceAndSaveByUserPage from './pages/PeaceAndSaveByUser.vue';
import PerformanceStatisticsPerLevelGraphPage from './pages/PerformanceStatisticsPerLevelGraph.vue';
import PerformanceStatisticsByGroupGraphPage from './pages/PerformanceStatisticsByGroupGraph.vue';
import SummaryOfCompetenciesPage from './pages/SummaryOfCompetencies.vue';
import SummaryOfOverallAveragesPage from './pages/SummaryOfOverallAverages.vue';
import EndOfYear from './pages/EndOfYear.vue';
import NotesByActivityCategories from './pages/NotesByActivityCategories.vue';
import ReportObservationStudentVue from './pages/ReportObservationStudent.vue';
import ReportCardEndOfYear from './pages/ReportCardEndOfYear.vue';
import BookGrade from './pages/BookGrade.vue';
import ReportPeaceSafety from './pages/ReportPeaceSafety.vue';
import ReportFinalPeriodNotes from './pages/ReportFinalPeriodNotes.vue';
import ConsolidatePeriodsNotesPage from './pages/ConsolidatePeriodsNotes.vue';
import EvaluationComissionPage from './pages/EvaluationComission.vue';
import ReportExcelentAcademicPage from './pages/ReportExcelentAcademic.vue';
import ConsolidateOutcomesPage from './pages/consolidateOutcomes.vue';
import ProgressOutcomesTeacherPage from './pages/ProgressOutcomesTeacher.vue';
import LearningPLanPage from './pages/LearningPLan.vue';
import ConsolidateSemiannualPeriodsNotes from './pages/ConsolidateSemiannualPeriodsNotes.vue';
import ObserverReportPage from './pages/ObserverReport.vue';
import ReportReprobationSchool from './pages/ReportReprobationSchool.vue';
import ReportFinalPerformanceEvaluation from './pages/ReportFinalPerformanceEvaluation.vue';
import TrainingCertificatePage from './pages/TrainingCertificate.vue';
const appName = 'reports';

export const reportsRouting = [
  {
    path: '',
    component: ReportListPage,
    name: `${appName}.list`,
  },
  {
    path: 'attendance/:type',
    component: AttendancePage,
    name: `${appName}.attendance`,
  },
  {
    path: 'degree-sumary/week',
    component: DegreeSummaryPage,
    name: `${appName}.degreeSummary`,
  },
  {
    path: 'period-summary-by-group',
    component: PeriodSummaryByGroupPage,
    name: `${appName}.periodSummaryByGroup`,
  },
  {
    path: 'period-summary-group-new',
    component: PeriodSummaryGroupNewPage,
    name: `${appName}.periodSummaryGroupNew`,
  },
  {
    path: 'tutor-with-students-list',
    component: TutorWithStudentsPage,
    name: `${appName}.tutorWithStudents`,
  },
  {
    path: 'tutor-with-students-list-new',
    component: TutorWithStudentsNewPage,
    name: `${appName}.tutorWithStudentsNew`,
  },

  {
    path: 'students-by-level',
    component: StudentsByLevelPage,
    name: `${appName}.studentsByLevel`,
  },
  {
    path: 'daily-attendance',
    component: DailyAttendanceByGroupPage,
    name: `${appName}.dailyAttendanceByGroup`,
  },
  {
    path: 'attendance-record-control',
    component: AttendanceRecordControlPage,
    name: `${appName}.attendanceRecordControl`,
  },
  {
    path: 'announcements-reception',
    component: AnnouncementsReceptionPage,
    name: `${appName}.announcementsReception`,
  },
  {
    path: 'notifications-reception',
    component: NotificationsReceptionPage,
    name: `${appName}.notificationsReception`,
  },
  {
    path: 'disciplinary-record',
    component: DisciplinaryRecordPage,
    name: `${appName}.disciplinaryRecord`,
  },
  {
    path: 'status-activities',
    component: StatusActivitiesPage,
    name: `${appName}.statusActivities`,
  },
  {
    path: 'tutor-list',
    component: TutorListPage,
    name: `${appName}.tutorList`,
  },

  {
    path: 'teachers-by-level',
    component: TeachersByLevelPage,
    name: `${appName}.teachersByLevel`,
  },
  {
    path: 'degree-summary-quick-view',
    component: DegreeSummaryQuickViewPage,
    name: `${appName}.degreeSummaryQuickView`,
  },
  {
    path: 'summary-teacher-quick-view',
    component: SummaryTeacherQuickViewPage,
    name: `${appName}.summaryTeacherQuickView`,
  },
  {
    path: 'student-performance-by-group',
    component: StudentPerformanceByGroupPage,
    name: `${appName}.studentPerformanceByGroup`,
  },
  {
    path: 'performance-per-period',
    component: PerformancePerPeriodPage,
    name: `${appName}.performancePerPeriod`,
  },
  {
    path: 'student-performance',
    component: StudentPerformancePage,
    name: `${appName}.studentPerformance`,
  },
  {
    path: 'student-disciplinary-summary',
    component: StudentDisciplinarySummaryPage,
    name: `${appName}.studentDisciplinarySummary`,
  },
  {
    path: 'summary-averages-by-grades',
    component: SummaryAveragesByGradesPage,
    name: `${appName}.summaryAveragesByGrades`,
  },
  {
    path: 'performance-by-student',
    component: PerformanceByStudentPage,
    name: `${appName}.performanceByStudent`,
  },
  {
    path: 'summary-of-averages-by-group',
    component: SummaryOfAveragesByGroupPage,
    name: `${appName}.summaryOfAveragesByGroup`,
  },
  {
    path: 'report-card',
    component: ReportCardPage,
    name: `${appName}.reportCard`,
  },
  {
    path: 'note-final',
    component: EndOfYear,
    name: `${appName}.EndOfYear`,
  },
  {
    path: 'subject-performance-by-grade',
    component: SubjectPerformanceByGradePage,
    name: `${appName}.subjectPerformanceByGrade`,
  },
  {
    path: 'period-summary-by-teacher',
    component: PeriodSummaryByTeacherPage,
    name: `${appName}.periodSummaryByTeacher`,
  },
  {
    path: 'student-information',
    component: StudentInformationPage,
    name: `${appName}.studentInformation`,
  },
  {
    path: 'medical-records-by-student',
    component: MedicalRecordsByStudentPage,
    name: `${appName}.medicalRecordsByStudent`,
  },
  {
    path: 'performance-statistics-by-level',
    component: PerformanceStatisticsPerLevel,
    name: `${appName}.performanceStatisticsPerLevel`,
  },
  {
    path: 'performance-statistics-by-group',
    component: PerformanceStatisticsByGroupPage,
    name: `${appName}.performanceStatisticsByGroup`,
  },
  {
    path: 'summary-averages-half-unit',
    component: SummaryAveragesHalfUnitPage,
    name: `${appName}.summaryAveragesHalfUnit`,
  },
  {
    path: 'disabled-students-report-card',
    component: DisabledStudentsReportCardPage,
    name: `${appName}.disabledStudentsReportCard`,
  },
  {
    path: 'average-overall-per-week',
    component: AverageOverallPerWeekPage,
    name: `${appName}.averageOverallPerWeek`,
  },
  {
    path: 'certificate-matriculate',
    component: CertificateMatriculateByUserPage,
    name: `${appName}.certificateMatriculateByUser`,
  },
  {
    path: 'constancy-matriculate',
    component: ConstancyMatriculateByUserPage,
    name: `${appName}.constancyMatriculateByUser`,
  },
  {
    path: 'blocked-students-summarized',
    component: BlockedStudentsPage,
    name: `${appName}.blockedStudentsSummarized`,
  },
  {
    path: 'massive-load-education-ministries',
    component: MassiveLoadEducationMinistriesPage,
    name: `${appName}.massiveLoadEducationMinistries`,
  },
  {
    path: 'education-ministries',
    component: EducationMinistriesPage,
    name: `${appName}.educationMinistries`,
  },
  {
    path: 'peace-and-save-by-user',
    component: PeaceAndSaveByUserPage,
    name: `${appName}.peaceAndSaveByUserPage`,
  },
  {
    path: 'performance-statistics-by-level-with-graph',
    component: PerformanceStatisticsPerLevelGraphPage,
    name: `${appName}.performanceStatisticsPerLevelWithGraph`,
  },
  {
    path: 'performance-statistics-by-group-with-graph',
    component: PerformanceStatisticsByGroupGraphPage,
    name: `${appName}.performanceStatisticsByGroupWithGraph`,
  },
  {
    path: 'summary-of-competencies',
    component: SummaryOfCompetenciesPage,
    name: `${appName}.summaryOfCompetencies`,
  },
  {
    path: 'summary-of-overall-averages',
    component: SummaryOfOverallAveragesPage,
    name: `${appName}.summaryOfOverallAverages`,
  },
  {
    path: 'notes-by-activity-categories',
    component: NotesByActivityCategories,
    name: `${appName}.notesByActivityCategories`,
  },
  {
    path: 'observation-student',
    component: ReportObservationStudentVue,
    name: `${appName}.observationStudent`,
  },
  {
    path: 'book-grade',
    component: BookGrade,
    name: `${appName}.bookGrade`,
  },
  {
    path: 'end-of-year',
    component: ReportCardEndOfYear,
    name: `${appName}.reportCardEndOfYear`,
  },
  {
    path: 'peace-safety',
    component: ReportPeaceSafety,
    name: `${appName}.peaceSafety`,
  },
  {
    path: 'final-period-notes',
    component: ReportFinalPeriodNotes,
    name: `${appName}.finalPeriodNotes`,
  },
  {
    path: 'consolidate-periods-notes',
    component: ConsolidatePeriodsNotesPage,
    name: `${appName}.ConsolidatePeriodsNotes`,
  },
  {
    path: 'evaluation-comission',
    component: EvaluationComissionPage,
    name: `${appName}.EvaluationComission`,
  },
  {
    path: '/reports/excelentAcademic',
    component: ReportExcelentAcademicPage,
    name: `${appName}.ExcelentAcademic`,
  },
  {
    path: '/reports/consolidateOutcomes',
    component: ConsolidateOutcomesPage,
    name: `${appName}.ConsolidateOutcomes`,
  },
  {
    path: '/reports/progressOutcomesTeacher',
    component: ProgressOutcomesTeacherPage,
    name: `${appName}.ProgressOutcomesTeacher`,
  },
  {
    path: '/reports/learningPlan',
    component: LearningPLanPage,
    name: `${appName}.learningPlan`,
  },
  {
    path: 'consolidate-semiannual-periods-notes',
    component: ConsolidateSemiannualPeriodsNotes,
    name: `${appName}.ConsolidateSemiannualPeriodsNotes`,
  },
  {
    path: 'observer-report',
    component: ObserverReportPage,
    name: `${appName}.observerReport`,
  },
  {
    path: '/reports/reprobationSchool',
    component: ReportReprobationSchool,
    name: `${appName}.ReprobationSchool`,
  },
  {
    path: '/reports/finalPerformanceEvaluation',
    component: ReportFinalPerformanceEvaluation,
    name: `${appName}.FinalPerformanceEvaluation`,
  },
  {
    path: '/reports/training-certificate',
    component: TrainingCertificatePage,
    name: `${appName}.TrainingCertificate`,
  },
];
