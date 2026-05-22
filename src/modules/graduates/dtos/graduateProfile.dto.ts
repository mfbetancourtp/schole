import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export interface GraduateProfileDto {
  id: number;
  fullName: string;
  program: string;
  graduationYear: number;
  city: string;
  country: string;
  email: string;
  phone: string;
  professionalSummary: string;
  employmentStatus: 'Empleado' | 'Desempleado' | 'Independiente' | 'Estudiando';
  photoUrl: string | null;
  linkedin: string;
  portfolio: string;
  website: string;
  completionPercentage: number;
}

export interface PersonalInformation {
  id: number;
  peopleId: number;
  municipalityId: number | null;
  countryId: number | null;
  summary: string;
  linkedin: string | null;
  briefcase: string | null;
  webSite: string | null;
  employmentStatus: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UpsertPersonalInformationRequest {
  peopleId: number;
  municipalityId: number | null;
  countryId: number | null;
  summary: string;
  linkedin: string | null;
  briefcase: string | null;
  webSite: string | null;
}

export interface ProfileCompletionSectionDto {
  section: string;
  completed: boolean;
}

export interface ProfileCompletionDto {
  percentage: number;
  completedPoints: number;
  totalPoints: number;
  personalInformation: { field: string; completed: boolean }[];
  sections: ProfileCompletionSectionDto[];
}

export interface PersonalInformationPagination {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PersonalInformationResponse {
  data: PersonalInformation[];
  pagination: PersonalInformationPagination;
}

//common params for graduates module, people id and institution id that is 75
export interface GetCommonParams extends ParamsPaginationDto {
  peopleId?: number;
  institutionId?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export type GetPersonalInformationParams = GetCommonParams;

export interface AdditionalEducationStudyType {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdditionalEducation {
  id: number;
  peopleId: number;
  institution: string;
  studyTypeId: number;
  title: string;
  area: string;
  startDate: string;
  endDate: string | null;
  currentlyStudyThere: 0 | 1;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  studyType: AdditionalEducationStudyType;
}

export interface UpsertAdditionalEducationRequest {
  peopleId: number;
  title: string;
  educationTypesId: number;
  institution: string;
  area: string;
  startDate: string;
  endDate: string | null;
  currentlyStudyThere: 0 | 1;
  description: string;
}

//work experience
export interface WorkExperienceMunicipality {
  id: number;
  regionId: number;
  regionCode: string;
  countryId: number;
  countryCode: string;
  name: string;
}

export interface WorkExperience {
  id: number;
  peopleId: number;
  jobTitle: string;
  company: string;
  area: string;
  municipalityId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  currentlyWorksThere: 0 | 1;
  functionsDescription: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  municipality: WorkExperienceMunicipality | null;
}

export const normalizeAdditionalEducation = (raw: any): AdditionalEducation => {
  const currentlyStudyThereRaw = raw?.currentlyStudyThere ?? raw?.currentlyStudying ?? raw?.currentlyStudy;
  const currentlyStudyThere =
    typeof currentlyStudyThereRaw === 'number' ? (currentlyStudyThereRaw === 1 ? 1 : 0) : typeof currentlyStudyThereRaw === 'boolean' ? (currentlyStudyThereRaw ? 1 : 0) : raw?.endDate ? 0 : 1;

  return {
    id: Number(raw?.id ?? 0),
    peopleId: Number(raw?.peopleId ?? 0),
    institution: String(raw?.institution ?? ''),
    studyTypeId: Number(raw?.educationType?.id ?? raw?.studyTypeId ?? raw?.educationTypesId ?? raw?.studyType?.id ?? 0),
    title: String(raw?.title ?? ''),
    area: String(raw?.area ?? ''),
    startDate: String(raw?.startDate ?? ''),
    endDate: raw?.endDate ? String(raw.endDate) : null,
    currentlyStudyThere,
    description: String(raw?.description ?? ''),
    createdAt: String(raw?.createdAt ?? ''),
    updatedAt: String(raw?.updatedAt ?? ''),
    deletedAt: raw?.deletedAt ? String(raw.deletedAt) : null,
    studyType: {
      id: Number(raw?.educationType?.id ?? raw?.studyType?.id ?? raw?.studyTypeId ?? 0),
      institutionId: Number(raw?.educationType?.institutionId ?? raw?.studyType?.institutionId ?? 0),
      name: String(raw?.educationType?.name ?? raw?.studyType?.name ?? ''),
      code: String(raw?.educationType?.code ?? raw?.studyType?.code ?? ''),
      createdAt: String(raw?.educationType?.createdAt ?? raw?.studyType?.createdAt ?? ''),
      updatedAt: String(raw?.educationType?.updatedAt ?? raw?.studyType?.updatedAt ?? ''),
      deletedAt: raw?.educationType?.deletedAt ? String(raw.educationType.deletedAt) : raw?.studyType?.deletedAt ? String(raw.studyType.deletedAt) : null,
    },
  };
};

export const normalizeWorkExperience = (raw: any): WorkExperience => {
  const currentlyWorksThereRaw = raw?.currentlyWorksThere ?? raw?.currentlyWorkThere ?? raw?.currentJob;
  const currentlyWorksThere =
    typeof currentlyWorksThereRaw === 'number' ? (currentlyWorksThereRaw === 1 ? 1 : 0) : typeof currentlyWorksThereRaw === 'boolean' ? (currentlyWorksThereRaw ? 1 : 0) : raw?.endDate ? 0 : 1;

  return {
    id: Number(raw?.id ?? 0),
    peopleId: Number(raw?.peopleId ?? 0),
    jobTitle: String(raw?.jobTitle ?? ''),
    company: String(raw?.company ?? ''),
    area: String(raw?.area ?? ''),
    municipalityId: Number(raw?.municipalityId ?? raw?.municipality?.id ?? 0),
    startDate: String(raw?.startDate ?? ''),
    endDate: raw?.endDate ? String(raw.endDate) : null,
    currentlyWorksThere,
    functionsDescription: String(raw?.functionsDescription ?? raw?.currentWorkDescription ?? ''),
    createdAt: String(raw?.createdAt ?? ''),
    updatedAt: String(raw?.updatedAt ?? ''),
    deletedAt: raw?.deletedAt ? String(raw.deletedAt) : null,
    municipality: raw?.municipality
      ? {
          id: Number(raw.municipality.id ?? 0),
          regionId: Number(raw.municipality.regionId ?? 0),
          regionCode: String(raw.municipality.regionCode ?? ''),
          countryId: Number(raw.municipality.countryId ?? 0),
          countryCode: String(raw.municipality.countryCode ?? ''),
          name: String(raw.municipality.name ?? ''),
        }
      : null,
  };
};

export type GraduateSkillDomainLevel = 'Principiante' | 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto';

export interface GraduateSkillCategoryDto {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GraduateSkillDto {
  id: number;
  peopleId: number;
  name: string;
  skillCategoryId: number;
  domainLevel: GraduateSkillDomainLevel;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  skillCategory: GraduateSkillCategoryDto;
}

export interface GraduateSkillsPaginationDto {
  page: number;
  perPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GraduateSkillsResponseDto {
  data: GraduateSkillDto[];
  pagination: GraduateSkillsPaginationDto;
}

export interface GetSkillsParams extends GetCommonParams {
  peopleId: number;
  institutionId: number;
}

export interface UpsertGraduateSkillRequest {
  peopleId: number;
  name: string;
  skillCategoryId: number;
  domainLevel: GraduateSkillDomainLevel;
}

export interface GetSkillCategoriesParams {
  institutionId: number;
}

export interface SkillCategoriesPaginationDto {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SkillCategoriesResponseDto {
  data: GraduateSkillCategoryDto[];
  pagination: SkillCategoriesPaginationDto;
}

export interface GetStudyTypesParams extends GetCommonParams {
  institutionId: number;
  noPag?: boolean;
}

export interface StudyTypesResponseDto {
  data: AdditionalEducationStudyType[];
  pagination: SkillCategoriesPaginationDto;
}

export interface UpsertWorkExperienceRequest {
  peopleId: number;
  jobTitle: string;
  company: string;
  area: string;
  municipalityId?: number | null;
  startDate: string;
  endDate: string | null;
  currentlyWorksThere: 0 | 1;
  functionsDescription: string;
}
