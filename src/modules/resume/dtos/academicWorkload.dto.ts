export interface Teacher {
  id: number;
  name: string;
  code: string;
  department: string;
  initials: string;
  email?: string;
  phone?: string;
}

export interface WeeklyData {
  day: string;
  scheduled: number;
  taught: number;
}

export interface DailyDetail {
  date: string;
  dayName: string;
  scheduled: string;
  taught: string;
  compliance: number;
  status: string;
}

export interface CourseDetail {
  code: string;
  name: string;
  hoursPerWeek: string;
  hoursTaught: string;
  classes: string;
  delays: number;
  status: string;
}

export interface WorkloadData {
  hoursTaught: number;
  hoursScheduled: number;
  hoursTrend: number;
  compliance: number;
  complianceTrend: number;
  completeDays: number;
  totalDays: number;
  completeDaysTrend: number;
  alertCourses: number;
  alerts: string[];
  weeklyData: WeeklyData[];
  dailyDetail: DailyDetail[];
  courseDetail: CourseDetail[];
}

export interface AcademicWorkloadFilters {
  teacherId?: number;
  period: {
    month: number;
    year: number;
  };
  startDate?: string;
  endDate?: string;
}

export interface AcademicWorkloadResponse {
  teacher: Teacher;
  workload: WorkloadData;
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
}

export interface TeacherSearchResult {
  teachers: Teacher[];
  total: number;
}
