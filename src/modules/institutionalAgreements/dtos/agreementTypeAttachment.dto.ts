export interface AgreementTypeAttachmentDto {
  id?: number | string;
  agreementsTypesId?: number | string;
  name: string;
  description: string;
  required: number | boolean;
  isActive: number | boolean;
}

export interface CreateAgreementTypeAttachmentDto {
  agreementsTypesId?: number | string;
  name: string;
  description: string;
  required?: number | boolean;
  isActive?: number | boolean;
}
