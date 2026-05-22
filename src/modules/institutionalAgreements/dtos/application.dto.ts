export type ApplicationStatus = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'En revisión';

export interface ApplicationDto {
  id: string;
  studentName: string;
  studentInitials: string;
  studentDocument: string;
  studentProgram: string;
  studentSemester: number;
  grade: number;
  applicationDate: string;
  status: ApplicationStatus;
  docsSubmitted: number;
  docsRequired: number;
}

export interface ApplicationStatsDto {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  availableSlots: number;
  totalSlots: number;
}
