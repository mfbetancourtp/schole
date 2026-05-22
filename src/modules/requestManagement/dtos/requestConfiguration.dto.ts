export interface CategoryItem {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface RequestTypeItem {
  id: number;
  code?: string;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  rollId?: number;
  requiresPayment: boolean;
  cost: string | null;
  value?: number | null;
  paymentMethodsId?: number | null;
  requiresApproval: boolean;
  requiresAttachments?: boolean;
  documentTemplatesId?: number | null;
  estimatedResponseTime?: string;
  isActive: boolean;
  requiredDocuments?: RequiredDocumentFormData[];
}

export interface RequiredDocumentFormData {
  applicationDocumentRequiredId?: number | null;
  code?: string;
  name: string;
  description: string;
  isRequired: boolean;
}

export interface RequestTypeFormData {
  code?: string;
  name: string;
  categoryId: number | null;
  description: string;
  targetAudience: string;
  requiresPayment: boolean;
  cost: number;
  paymentMethodsId?: number | null;
  requiresApproval: boolean;
  requiresAttachments: boolean;
  documentTemplate: string;
  documentTemplatesId?: number | null;
  processFlow: string;
  estimatedTime: string;
  isActive: boolean;
  requiredDocuments: RequiredDocumentFormData[];
}

export interface RequestConfigurationPageData {
  categories: CategoryItem[];
  requestTypes: RequestTypeItem[];
}

export interface applicationTypeDocumentFormData {
  applicationTypesId: number;
  applicationDocumentRequiredId: number;
}

//post relate doc soli-type
export interface ApplicationTypeDocumentRelateItem {
  applicationTypesId: number;
  applicationDocumentRequiredId?: number | null;
}
export interface ApplicationTypeDTO {
  id: number;
  name: string;
}

export interface applicationDocumentRequiredDto {
  id: number;
  code: string;
  name: string;
}

//documentos requeridos get
export interface ApplicationDocumentRequiredItem {
  id: number;
  code: string;
  name: string;
  description: string;
  isRequired: boolean;
}

export interface ApplicationDocumentRequiredFormData {
  code: string;
  name: string;
  description: string;
}
