/** Estado posible de un registro de asistencia */
export type AttendanceStatus = 'Puntual' | 'Tardanza' | 'Falta' | 'Justificado';

/** Estado de validación del registro */
export type ValidationStatus = 'Validado' | 'Pendiente';

/** Registro individual de asistencia */
export interface AttendanceRecordDto {
  id: number;
  date: string;
  dayName: string;
  entryTime: string | null;
  exitTime: string | null;
  totalHours: number | null;
  status: AttendanceStatus;
  statusDetail?: string;
  validation: ValidationStatus;
}

/** Resumen estadístico del período */
export interface AttendanceSummaryDto {
  attendedDays: number;
  totalDays: number;
  attendancePercentage: number;
  delays: number;
  absences: number;
  totalHours: number;
  validatedRecords: number;
  totalRecords: number;
  validationPercentage: number;
}

/** Filtros de consulta de asistencia */
export interface AttendanceFilterDto {
  startDate: string | null;
  endDate: string | null;
  status: AttendanceStatus | null;
}
