import type { CategoryItem, RequestTypeItem, RequestConfigurationPageData } from '../dtos/requestConfiguration.dto';

export const categoriesMock: CategoryItem[] = [
  {
    id: 1,
    name: 'Certificaciones Académicas',
    description: 'Documentos oficiales de certificación académica',
    isActive: true,
  },
  {
    id: 2,
    name: 'Trámites Financieros',
    description: 'Solicitudes relacionadas con pagos y finanzas',
    isActive: true,
  },
  {
    id: 3,
    name: 'Trámites Administrativos',
    description: 'Gestiones administrativas generales',
    isActive: true,
  },
  {
    id: 4,
    name: 'Trámites de Grado',
    description: 'Solicitudes relacionadas con proceso de graduación',
    isActive: false,
  },
];

export const requestTypesMock: RequestTypeItem[] = [
  {
    id: 1,
    name: 'Certificado de Notas',
    description: 'Documento oficial con registro completo de calificaciones',
    categoryId: 1,
    categoryName: 'Certificaciones Académicas',
    requiresPayment: true,
    cost: '$15.000',
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 2,
    name: 'Certificado de Matrícula',
    description: 'Constancia oficial de inscripción al periodo académico',
    categoryId: 1,
    categoryName: 'Certificaciones Académicas',
    requiresPayment: false,
    cost: null,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 3,
    name: 'Paz y Salvo',
    description: 'Certificación de no tener deudas pendientes',
    categoryId: 2,
    categoryName: 'Trámites Financieros',
    requiresPayment: false,
    cost: null,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 4,
    name: 'Constancia de Estudios',
    description: 'Documento que acredita la condición de estudiante activo',
    categoryId: 1,
    categoryName: 'Certificaciones Académicas',
    requiresPayment: true,
    cost: '$8.000',
    requiresApproval: false,
    isActive: true,
  },
];

export const requestConfigurationPageMock: RequestConfigurationPageData = {
  categories: categoriesMock,
  requestTypes: requestTypesMock,
};

// Options for selects in the request type form
export const targetAudienceOptions = [
  { value: 'students', label: 'Estudiantes' },
  { value: 'graduates', label: 'Egresados' },
  { value: 'teachers', label: 'Docentes' },
  { value: 'all', label: 'Todos' },
];

export const documentTemplateOptions = [
  { value: 'cert_notas', label: 'Plantilla Certificado de Notas' },
  { value: 'cert_matricula', label: 'Plantilla Certificado de Matrícula' },
  { value: 'paz_salvo', label: 'Plantilla Paz y Salvo' },
  { value: 'constancia', label: 'Plantilla Constancia General' },
];

export const processFlowOptions = [
  { value: 'standard', label: 'Flujo Estándar' },
  { value: 'approval', label: 'Flujo con Aprobación' },
  { value: 'payment', label: 'Flujo con Pago' },
  { value: 'complex', label: 'Flujo Complejo (Pago + Aprobación)' },
];

// Pre-filled form data for editing request types (matches table data)
export const requestTypeEditDataMock: Record<
  number,
  {
    targetAudience: string;
    requiresAttachments: boolean;
    documentTemplate: string;
    processFlow: string;
    estimatedTime: string;
  }
> = {
  1: {
    targetAudience: 'students',
    requiresAttachments: true,
    documentTemplate: 'cert_notas',
    processFlow: 'complex',
    estimatedTime: '2-3 días hábiles',
  },
  2: {
    targetAudience: 'students',
    requiresAttachments: false,
    documentTemplate: 'cert_matricula',
    processFlow: 'approval',
    estimatedTime: '1-2 días hábiles',
  },
  3: {
    targetAudience: 'all',
    requiresAttachments: false,
    documentTemplate: 'paz_salvo',
    processFlow: 'payment',
    estimatedTime: '3-5 días hábiles',
  },
  4: {
    targetAudience: 'students',
    requiresAttachments: false,
    documentTemplate: 'constancia',
    processFlow: 'standard',
    estimatedTime: '1-2 días hábiles',
  },
};
