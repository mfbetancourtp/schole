export type AgreementsApplicationStatus = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface AgreementsApplicationDto {
  id: number;
  agreementsInstitutionalId: number;
  userId?: number;
  motivation: string;
  areaId?: number;
  languageLevel?: string;
  previousExperience?: string;
  estimatedStartDate?: string;
  estimatedDuration?: string;
  confirmRequirements?: number;
  acceptTerms?: number;
  status: AgreementsApplicationStatus;
}

export interface CreateAgreementsApplicationDto {
  agreementsInstitutionalId: number;
  motivation: string;
  areaId?: number;
  languageLevel?: string;
  previousExperience?: string;
  estimatedStartDate?: string;
  estimatedDuration?: string;
  confirmRequirements?: number;
  acceptTerms?: number;
}

export interface UpdateAgreementsApplicationDto {
  motivation?: string;
  areaId?: number;
  languageLevel?: string;
  previousExperience?: string;
  estimatedStartDate?: string;
  estimatedDuration?: string;
  status?: AgreementsApplicationStatus;
}

export interface AgreementsApplicationStatsDto {
  totalApplications: number;
  inReview: number;
  approved: number;
  rejected: number;
}

export interface ApplicationTrackingDto {
  id: number;
  agreementsApplicationId: number;
  stage: string;
  description?: string | null;
  isCompleted: number | boolean;
  completedAt?: string | null;
  createdAt: string;
}

export interface DocumentProgressDto {
  totalRequired: number;
  uploaded: number;
  approved: number;
  percentage: number;
}

export interface ApplicationWithRelationsDto extends AgreementsApplicationDto {
  agreementName?: string;
  institutionPartner?: string;
  countryName?: string;
  typeName?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    userToken: string;
    people?: {
      identification: string;
      names: string;
      lastnames: string;
    };
  };
  area?: {
    id: number;
    name: string;
  };
  agreementsInstitutional?: {
    id: number;
    name: string;
    code?: string;
    institutionPartner?: string;
    maximumCapacity?: number;
    starDay?: string;
    endDate?: string;
    country?: {
      id: number;
      name: string;
      translations?: string | Record<string, string>;
    };
    agreementsType?: { id: number; name: string };
    faculty?: { id: number; name: string };
    program?: { id: number; name: string };
  };
  documentProgress?: DocumentProgressDto;
  tracking?: ApplicationTrackingDto[];
}
