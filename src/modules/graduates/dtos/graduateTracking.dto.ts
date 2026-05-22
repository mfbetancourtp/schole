export type TrackingStatus = 'Empleado' | 'Desempleado' | 'Independiente' | 'Estudiando';

export interface TrackedGraduateDto {
  id: number;
  name: string;
  avatar?: string;
  program: string;
  graduationYear: number;
  currentCompany?: string;
  currentRole?: string;
  status: TrackingStatus;
  salaryRange?: string;
  economicSector?: string;
  lastUpdated: string;
}

export const TRACKING_STATUS_COLOR: Record<TrackingStatus, string> = {
  Empleado: 'gt-badge--employed',
  Desempleado: 'gt-badge--unemployed',
  Independiente: 'gt-badge--independent',
  Estudiando: 'gt-badge--studying',
};

export interface GraduateDashboardWorkExperienceDto {
  jobTitle: string;
  company: string;
  area: string;
  startDate: string;
  endDate: string | null;
  municipality: { id: number; name: string };
  country: { id: number; name: string };
}

export interface GraduateDashboardRowDto {
  peopleId: number;
  names: string;
  lastnames: string;
  avatar: string | null;
  employmentStatus: string;
  company: string | null;
  area: string | null;
  lastUpdated: string | null;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  skills: string[];
  workExperiences: GraduateDashboardWorkExperienceDto[];
}
