export type DocumentRequestStatus = 'finalized' | 'in_review' | 'pending_payment' | 'approved' | 'rejected';

export interface DocumentType {
  id: number;
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  cost: string | null;
  isFree: boolean;
  estimatedTime: string;
}

export interface AcademicPeriodOption {
  id: number;
  label: string;
}

export interface ProgramTypeDto {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  description: string | null;
  isCurricular: 0 | 1;
  isActive: 0 | 1;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AcademicPeriodDto {
  id: number;
  institutionId: number;
  code: string;
  name: string;
  programTypeId: number;
  startDate: string;
  endDate: string;
  active: 0 | 1;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  programType: ProgramTypeDto;
  programsCount: number;
}

export interface AcademicPeriodsPaginationDto {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AcademicPeriodsResponseDto {
  data: AcademicPeriodDto[];
  pagination: AcademicPeriodsPaginationDto;
}

export interface GetAcademicPeriodsParams {
  institutionId: number;
}

export interface DocumentRequestFormData {
  applicationTypesId: number;
  academicPeriodsId: number;
  description: string;
}

export interface NewRequestFormData {
  documentTypeId: number;
  academicPeriodId: number | null;
  reason: string;
  attachment: File | null;
}

export interface RequestListItem {
  id: string;
  documentType: string;
  date: string;
  status: DocumentRequestStatus;
  statusLabel: string;
  observations: string;
  canDownload: boolean;
}

export interface ProcessTrackingEntry {
  id: number;
  title: string;
  actor: string;
  date: string;
  description: string;
}

export interface RequestDetail {
  id: string;
  status: DocumentRequestStatus;
  statusLabel: string;
  documentType: string;
  documentDescription: string;
  documentCost: string;
  documentTime: string;
  documentIcon: string;
  documentIconBgColor: string;
  documentIconColor: string;
  requestDate: string;
  observations: string;
  tracking: ProcessTrackingEntry[];
  canDownload: boolean;
}

export interface DocumentRequestPageData {
  catalog: DocumentType[];
  requests: RequestListItem[];
  academicPeriods: AcademicPeriodOption[];
}

export interface ApplicationTypeDTO {
  id: number;
  name: string;
}

export interface RequestStatusDTO {
  id: number;
  name: string;
}

export interface ApplicationDocumentRequiredDTO {
  id: number;
  code: string;
  name: string;
}

export interface DocumentRequestAttachmentDTO {
  id: number;
  fileUrl: string;
  applicationDocumentRequired: ApplicationDocumentRequiredDTO;
}

export interface DocumentRequestHistoryItemDTO {
  id: number;
  userId: number;
  description: string;
  createdAt: string;
  requestStatus: RequestStatusDTO;
}

export interface DocumentRequestDetailDTO {
  id: number;
  applicationTypesId: number;
  userId: number;
  academicPeriodsId: number;
  description: string | null;
  requestStatusId: number;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  applicationType: ApplicationTypeDTO;
  requestStatus: RequestStatusDTO;
  attachments: DocumentRequestAttachmentDTO[];
  history: DocumentRequestHistoryItemDTO[];
}
