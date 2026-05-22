export interface IndustryDto {
  id: number;
  institutionId: number;
  name: string;
  code: string;
}

export interface CompanySizeDto {
  id: number;
  institutionId: number;
  name: string;
  code: string;
}

export interface MunicipalityDto {
  id: number;
  name: string;
  region?: {
    id: number;
    name: string;
    country?: {
      id: number;
      name: string;
    };
  };
}

export interface CompanyDto {
  id: number;
  photoUrl: string;
  institutionId: number;
  name: string;
  industryId: number;
  companySizeId: number;
  municipalityId: number;
  webPage?: string;
  mobile?: string;
  email?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  activeJobVacancies?: number;
  industry?: IndustryDto;
  companySize?: CompanySizeDto;
  municipality?: MunicipalityDto;
}

export interface CreateOrUpdateCompanyDto {
  name: string;
  photoUrl?: string;
  industryId: number | null;
  companySizeId: number | null;
  municipalityId: number | null;
  webPage?: string;
  mobile?: string;
  email?: string;
  description?: string;
}
