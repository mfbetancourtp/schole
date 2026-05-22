export type AgreementsApplicationDocumentStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface AgreementsApplicationDocumentDto {
  id: number;
  agreementsApplicationId?: number;
  agreementsTypesAttachmentsId?: number;
  fileUrl: string;
  status: AgreementsApplicationDocumentStatus | null;
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string;
  agreementsTypesAttachment?: {
    id: number;
    name: string;
    description?: string;
    required: boolean | number;
  };
  agreementsInstitutionalDocument?: any;
}

export interface CreateAgreementsApplicationDocumentDto {
  agreementsApplicationId: number;
  agreementsTypesAttachmentsId?: number;
  agreementsInstitutionalDocumentsId?: number;
  archivo: File;
}

export interface UpdateAgreementsApplicationDocumentDto {
  fileUrl?: string;
  status?: AgreementsApplicationDocumentStatus;
  reviewComments?: string;
}
