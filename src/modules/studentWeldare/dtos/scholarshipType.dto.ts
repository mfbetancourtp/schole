export interface ScholarshipTypeDto {
  id: number;
  name: string;
  description: string;
  abbreviation: string;
  isActive: boolean;
  minimumSemesterAverage: number;
  minimumSemesterCredits: number;
  automaticRenewal: boolean;
  compatibleOtherScholarship: boolean;
  maximumRenewals: number;
}

export interface CreateOrUpdateScholarshipTypeDto {
  name: string;
  description: string;
  abbreviation: string;
  isActive: boolean;
  minimumSemesterAverage: number;
  minimumSemesterCredits: number;
  automaticRenewal: boolean;
  compatibleOtherScholarship: boolean;
  maximumRenewals: number;
}

export interface RequiredDocumentDto {
  id: number;
  typeScholarshipId: number;
  scholarshipDocumentId: number;
  scholarshipDocument?: ScholarshipDocumentBasicDto;
}

export interface ScholarshipDocumentBasicDto {
  id: number;
  code: string;
  name: string;
  description: string;
  abjuntoType: string;
  isActive: boolean;
}

export interface ScholarshipRequirementDto {
  id: number;
  requirementType: string;
  operator: string;
  value: number | string;
  isRequired: boolean;
}

export interface DefaultRequirementDto {
  id: number;
  typeScholarshipId: number;
  scholarshipRequirementId: number;
  scholarshipRequirement?: ScholarshipRequirementDto;
}

/** Item local en el drawer (puede ser nuevo o ya existente) */
export interface LocalRequirementItemDto {
  defReqId?: number; // ID en default-requirements (undefined = nuevo)
  requirementType: string;
  operator: string;
  value: number | string;
  isRequired: boolean;
}
