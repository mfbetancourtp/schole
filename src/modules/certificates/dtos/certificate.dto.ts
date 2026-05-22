export interface Certificate {
  id: number;
  name: string;
  description?: string;
  imageUrl: string;
  imagePreview?: string;
  createdAt: string;
  updatedAt: string;
  template: CertificateTemplate;
  variables: CertificateVariable[];
  status: 'draft' | 'published' | 'archived';
  canvas?: any;
  urlHtmlTemplate?: string;
  urlJsonTemplate?: string;
}

export interface CertificateTemplate {
  id: number;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  elements: TemplateElement[];
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'variable';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  styles: ElementStyles;
  variableKey?: string; // Para elementos de tipo variable
}

export interface ElementStyles {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  border?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

export interface CertificateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'image';
  defaultValue?: string;
  required: boolean;
  description?: string;
}

export interface CertificateListParams {
  page: number;
  perPage: number;
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CertificateListResponse {
  data: Certificate[];
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}
