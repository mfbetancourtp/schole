export type InstitutionalAgreementStatus = 'Activo' | 'Borrador' | 'Cerrado' | 'Finalizado';

export interface InstitutionalAgreementDocumentDto {
  id: number;
  name: string;
  required: number | boolean;
}

export interface InstitutionalAgreementDto {
  id: number;
  agreementsTypesId: number;
  agreementsType?: { id: number; name: string };
  code: string;
  name: string;
  institutionPartner: string;
  scope?: string;
  countryId: number;
  country?: { id: number; name: string };
  starDay: string | null;
  endDate: string | null;
  facultyId?: number;
  facultyIds?: number[];
  faculties?: Array<{ id: number; faculty: { id: number; name: string } }>;
  programId?: number;
  programIds?: number[];
  programs?: Array<{ id: number; program: { id: number; name: string } }>;
  roleIds?: number[];
  beneficiaries?: Array<{ id: number; role: { id: number; name: string } }>;
  beneficiariesTypesId?: number;
  beneficiariesType?: { id: number; name: string };
  maximumAverage: number;
  minimumSemester: number;
  maximumSemester: number;
  requiresEnrollment: number;
  requiresNoDisciplinary: number;
  requiresNoBlocks: number;
  municipalityId: number;
  municipality?: { id: number; name: string };
  descriptionPublic: string;
  comments: string;
  maximumCapacity: number;
  internalResponsible?: string;
  agreementVersion?: string;
  agreementStatus: InstitutionalAgreementStatus;
  documents?: InstitutionalAgreementDocumentDto[];
  documentMain?: string | null;
  documentAnexed?: string | null;
}

export interface CreateOrUpdateInstitutionalAgreementDto {
  agreementsTypesId: number;
  code: string;
  name: string;
  institutionPartner: string;
  scope?: string;
  countryId: number;
  starDay: string | null;
  endDate: string | null;
  facultyIds: number[];
  programIds: number[];
  roleIds?: number[];
  maximumAverage: number;
  minimumSemester: number;
  maximumSemester: number;
  requiresEnrollment: number;
  requiresNoDisciplinary: number;
  requiresNoBlocks: number;
  municipalityId: number;
  descriptionPublic: string;
  comments: string;
  maximumCapacity: number;
  internalResponsible?: string;
  agreementVersion?: string;
  agreementStatus: InstitutionalAgreementStatus;
}

export interface UpdateInstitutionalAgreementDetailDto extends CreateOrUpdateInstitutionalAgreementDto {
  documents: InstitutionalAgreementDocumentDto[];
}

export interface InstitutionalAgreementStatsDto {
  activeAgreements: number;
  draftAgreements: number;
  totalApplications: number;
  availableSpots: number;
}
