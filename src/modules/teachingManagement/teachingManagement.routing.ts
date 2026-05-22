import AttendanceRegistrationPage from './pages/AttendanceRegistration.vue';
// import AcademicWorkloadPage from '@/modules/teachingManagement/pages/AcademicWorkload.vue';
import ClassSchedulePage from './pages/ClassSchedulePage.vue';

import PaymentSlipsTeacherPage from './pages/PaymentSlipsTeacher.vue';
import TeacherSupportPanelPage from './pages/TeacherSupportPanel.vue';
import QrTeachersPage from './pages/QrTeachers.vue';
import AprovalOfEntrieAndExit from './pages/AprovalOfEntrieAndExit.vue';
import AcademicWorkloadTeacherPage from './pages/AcademicWorkloadTeacher.vue';
import TeacherResume from './pages/TeacherResume.vue';
const appName = 'teachingManagement';

export const teachingManagementRouting = [
  {
    path: 'dashboard',
    component: () => import('./pages/TeacherDashboard.vue'),
    name: `${appName}.dashboard`,
  },
  {
    path: 'managementqr',
    component: () => import('./pages/TeacherQRDetail.vue'),
    name: `${appName}.managementqr`,
  },
  {
    path: 'approvalOfEntriesAndExits',
    component: AprovalOfEntrieAndExit,
    name: `${appName}.approvalOfEntriesAndExits`,
  },
  {
    path: 'attendanceRegistration',
    component: AttendanceRegistrationPage,
    name: `${appName}.attendanceRegistrationtest`,
  },
  // Boletas de pago docentes

  {
    path: 'paymentSlipsTeachers',
    component: PaymentSlipsTeacherPage,
    name: `${appName}.paymentSlipsTeachers`,
  },
  // Conteo de horas académicas YC
  // {
  //   path: 'academicWorkload',
  //   component: AcademicWorkloadPage,
  //   name: `${appName}.academicWorkload`,
  // },

  // HORARIOS DE CLASES
  {
    path: 'classSchedule',
    component: ClassSchedulePage,
    name: `${appName}.classSchedule`,
  },
  // Conteo de horas académicas Jd
  {
    path: 'academicWorkload',
    component: AcademicWorkloadTeacherPage,
    name: `${appName}.academicWorkload`,
  },
  // Dashboard de asistencia docente
  {
    path: 'teacherSupportPanel',
    component: TeacherSupportPanelPage,
    name: `${appName}.teacherSupportPanel`,
  },
  // Gestión de códigos QR
  {
    path: 'qrTeachers',
    component: QrTeachersPage,
    name: `${appName}.qrTeachers`,
  },
  // Hoja de vida
  {
    path: 'teacherResume',
    component: TeacherResume,
    name: `${appName}.teacherResume`,
  },
];
