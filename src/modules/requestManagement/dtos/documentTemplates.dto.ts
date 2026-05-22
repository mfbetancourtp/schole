export interface DocumentTemplateTypeDto {
  id: number;
  name: string;
}

export interface DocumentTemplateDto {
  id: number;
  code: string;
  name: string;
  documentTemplatesTypeId: number;
  contentsHtml: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  documentTemplatesType: DocumentTemplateTypeDto;
}

export interface DocumentTemplateVarDto {
  id: number;
  documentTemplateId: number;
  code: string;
  label: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  documentTemplate: {
    id: number;
    name: string;
  };
}

export interface CreateOrUpdateDocumentTemplateDto {
  code: string;
  name: string;
  documentTemplatesTypeId: number | null;
  contentsHtml: string;
  status: number;
}

export interface DynamicVariable {
  key: string;
  label: string;
  description: string;
}
