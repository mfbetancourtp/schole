export type ContractType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type Modality = 'presencial' | 'remoto' | 'hibrido';
export type ExperienceLevel = 'junior' | 'semi-senior' | 'senior' | 'lider';

export interface JobVacancyCatalogItem {
  id: number;
  name: string;
  code?: string;
}

export interface GetJobVacanciesParams {
  page?: number;
  perPage?: number;
  search?: string;
  id?: number;
  name?: string;
  companyId?: number | null;
  modalityTypeId?: number | null;
  contractTypeId?: number | null;
  professionalAreaId?: number | null;
  municipalityId?: number | null;
  salaryRange?: string;
  experienceLevelId?: number | null;
  createdAt?: string;
}

export interface JobVacancyDto {
  id: number;
  name: string;
  company: JobVacancyCatalogItem | null;
  modalityType: JobVacancyCatalogItem | null;
  contractType: JobVacancyCatalogItem | null;
  professionalArea: JobVacancyCatalogItem | null;
  municipality: {
    id: number;
    name: string;
    region?: { country?: { name: string } };
  } | null;
  experienceLevel: JobVacancyCatalogItem | null;
  salaryRange: string | null;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  description: string;
  requirements: string;
  benefits: string | null;
  applicationDeadline: string | null;
  createdAt: string;
}

export interface JobVacancyStatDto {
  companyName: string;
  professionalAreaName: string;
  totalVacancies: number;
}

export interface GetJobVacanciesResponseDto {
  data: JobVacancyDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface UpsertJobVacancyRequest {
  name: string;
  companyId: number | null;
  modalityTypeId: number | null;
  contractTypeId: number | null;
  professionalAreaId: number | null;
  municipalityId: number | null;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  experienceLevelId: number | null;
  description: string;
  requirements: string;
  benefits: string;
  applicationDeadline: string;
}

export interface VacancyDto {
  id: number;
  title: string;
  company: string;
  companyId?: number;
  companyLogo?: string;
  city: string;
  country: string;
  modality: Modality;
  modalityTypeId?: number;
  contractType: ContractType;
  contractTypeId?: number;
  experienceLevel: ExperienceLevel;
  experienceLevelId?: number;
  professionalArea: string;
  professionalAreaId?: number;
  municipalityId?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  requirements: string;
  benefits?: string;
  applicationDeadline?: string;
  skills: string[];
  publishedAt: string;
  expiresAt?: string;
  applicantsCount: number;
  isRecommended?: boolean;
}
