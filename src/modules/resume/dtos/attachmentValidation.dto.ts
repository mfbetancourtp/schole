export type AttachmentValidationStatus = 'pending' | 'approved' | 'rejected';
export type AttachmentValidationStatusFilter = AttachmentValidationStatus | 'all';
export type AttachmentValidationDecisionStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';
export type AttachmentValidationCvSectionKey = 'academicBackground' | 'supplementaryTraining' | 'workExperience' | 'intellectualProduction' | 'academicEvents' | 'recognition';

export interface AttachmentValidationSectionOptionDto {
  label: string;
  value: AttachmentValidationCvSectionKey;
}

export interface AttachmentValidationSummaryDto {
  pending: number;
  approved: number;
  rejected: number;
}

export interface AttachmentValidationPaginationDto {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
}

export interface AttachmentValidationApiItemDto {
  peopleId: number;
  names: string;
  lastnames: string;
  totalDocuments: number;
  lastUpdate: string;
  overallStatus: string;
}

export interface AttachmentValidationResponseDto {
  data: AttachmentValidationApiItemDto[];
  pagination: AttachmentValidationPaginationDto;
}

export interface AttachmentValidationRecordDto {
  id: string;
  peopleId: number;
  fullName: string;
  teacherName: string;
  teacherPhoto?: string;
  teacherPosition: string;
  totalDocuments: number;
  documentsCount: number;
  lastUpdate: string;
  createdDate: string;
  overallStatus: string;
  status: AttachmentValidationStatus;
  recordTitle: string;
}

export interface AttachmentValidationLocationDto {
  id?: number;
  name?: string;
}

export interface AttachmentValidationPeopleDetailResponseDto {
  names: string;
  lastnames: string;
  identification: string | null;
  email: string | null;
  direction: string | null;
  mobile: string | null;
  city: AttachmentValidationLocationDto | string | null;
  country: AttachmentValidationLocationDto | string | null;
  cv: Record<string, any[]>;
}

export interface AttachmentValidationLogPayloadDto {
  key: string;
  documentId: number;
  peopleId: number;
  newStatus: AttachmentValidationDecisionStatus;
  observation: string;
}
