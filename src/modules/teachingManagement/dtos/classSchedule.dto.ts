export interface ClassScheduleDto {
  id: string;
  courseCode: string; // e.g., ING-101
  courseName: string; // e.g., Programación I
  day: string; // e.g., Lunes (Used for list view mainly, calendar uses date)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalHours: number;
  location: string; // e.g., Lab A-301
  modality: 'Presencial' | 'Virtual' | 'Híbrido';
  status: 'Cumplida' | 'En Curso' | 'Pendiente';
  date: string; // YYYY-MM-DD (For FullCalendar placement)
}

export interface TeacherProfileDto {
  id: string;
  name: string;
  department: string;
  code: string;
  avatarUrl?: string; // Optional
}

export interface ScheduleStatsDto {
  completed: number;
  inProgress: number;
  pending: number;
  weeklyHours: number;
}
