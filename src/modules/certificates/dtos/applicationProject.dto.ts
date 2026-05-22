export type ApplicationProjectStatus = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Cancelado';
export type ApplicationType = 'Individual' | 'En Pareja/Equipo';

export interface ApplicationProjectPersonDto {
  id: number;
  people: { names: string; lastnames: string; email: string };
}

export interface ApplicationProjectFacultyDto {
  id: number;
  name: string;
  code: string;
}

export interface ApplicationProjectScheduleSettingsDto {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface ApplicationProjectMemberDto {
  id: number;
  status: string;
  user: ApplicationProjectPersonDto;
}

export interface ApplicationProjectDocumentDto {
  id: number;
  documentType: string;
  documentUrl: string;
  createdAt: string;
}

export interface ApplicationProjectDto {
  id: number;
  name: string;
  description: string;
  applicationType: ApplicationType;
  unsupervised: number;
  status: ApplicationProjectStatus;
  createdAt: string;
  updatedAt: string;
  user: ApplicationProjectPersonDto;
  tutor: ApplicationProjectPersonDto | null;
  faculty: ApplicationProjectFacultyDto;
  scheduleSettings: ApplicationProjectScheduleSettingsDto;
  members: ApplicationProjectMemberDto[];
  documents: ApplicationProjectDocumentDto[];
}

export interface CreateApplicationProjectDto {
  facultyId: number;
  name: string;
  description: string;
  applicationType: ApplicationType;
  scheduleSettingsId: number;
  tutorId: number | null;
  unsupervised: number;
}

export interface UpdateApplicationProjectDto {
  name?: string;
  description?: string;
  facultyId?: number;
  applicationType?: ApplicationType;
  scheduleSettingsId?: number;
  tutorId?: number | null;
  unsupervised?: number;
  status?: ApplicationProjectStatus;
}

export interface FacultyDto {
  id: number;
  name: string;
  code: string;
}

export interface AdministrativeUserDto {
  id: number;
  people: { names: string; lastnames: string; email: string };
}

export interface ApplicationProjectPaginationDto {
  data: ApplicationProjectDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ApplicationProjectMemberListDto {
  id: number;
  userId: number;
  status: string;
  user: ApplicationProjectPersonDto;
}

export interface ApplicationProjectMembersPaginationDto {
  data: ApplicationProjectMemberListDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
  };
}

export interface AdminApplicationProjectStatsDto {
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminApplicationProjectListItemDto {
  id: number;
  name: string;
  description: string;
  applicationType: ApplicationType;
  unsupervised: number;
  status: ApplicationProjectStatus;
  createdAt: string;
  updatedAt: string;
  user: ApplicationProjectPersonDto;
  tutor: ApplicationProjectPersonDto | null;
  faculty: ApplicationProjectFacultyDto;
  scheduleSettings: { id: number; name: string };
}

export interface AdminApplicationProjectListPaginationDto {
  data: AdminApplicationProjectListItemDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface UpdateApplicationProjectStatusDto {
  status: ApplicationProjectStatus;
  tutorId?: number | null;
}
