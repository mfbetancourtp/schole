export interface AttendanceSummaryDto {
  punctualityPercentage: number;
  unpunctualityPercentage: number; // 100 - punctualityPercentage
  attendances: number;
  delays: number;
  absences: number;
  trend: number; // e.g. +5.2%
}

export interface AcademicLoadDto {
  activeCourses: number;
  assignedHours: number;
  taughtHours: number;
  taughtPercentage: number;
  semesterProgress: number;
  nextClass: {
    courseName: string;
    courseCode: string;
    time: string;
    location: string;
    isToday: boolean;
  };
}

export interface MonthlyHoursDto {
  accumulatedHours: number;
  monthlyGoal: number;
  goalProgress: number;
  projectedIncome: number;
  expectedIncome: number;
  incomeTrend: number;
  hoursToGoal: number;
}

export interface TeacherQRDto {
  code: string;
  status: 'Activo' | 'Inactivo';
  expirationDate: string;
  remainingDays: number;
  qrImageUrl: string; // Placeholder or base64
}

export interface TeacherDashboardDto {
  attendance: AttendanceSummaryDto;
  academicLoad: AcademicLoadDto;
  monthlyHours: MonthlyHoursDto;
  qr: TeacherQRDto;
}
