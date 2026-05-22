export type AdmissionProcessStatus = 'activo' | 'borrador' | 'finalizado' | 'inactivo';
export type AdmissionProcessStepType = string;
export type AdmissionProcessAppliesTo = 'nuevos' | 'antiguos';

export type AdmissionTone = 'blue' | 'green' | 'purple' | 'amber' | 'indigo' | 'gray';

export interface AdmissionSelectOption<T = string> {
  id: T;
  name: string;
}

export interface AdmissionProgramPeriod {
  id: string;
  nombre: string;
  modalidad: string;
  cupos: number;
  cuposOcupados: number;
}

export interface AdmissionAcademicPeriod {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  programas: AdmissionProgramPeriod[];
}

export interface AdmissionElementOption {
  id: string;
  name: string;
}

export interface AdmissionPaymentItem {
  id: string;
  conceptId: string;
  code?: string;
  title: string;
  defaultUnitValue: number;
  isOptional: boolean;
}

export interface AdmissionWorkflowStep {
  id: string;
  convocationStepId?: number | null;
  referenceStepId?: number | null;
  preloadedElementOptions?: AdmissionElementOption[];
  order: number;
  title: string;
  type: AdmissionProcessStepType;
  elementId: string;
  elementName: string;
  appliesTo: AdmissionProcessAppliesTo[];
  requiresApproval: boolean;
  solveAdmin: boolean;
  videoUrl: string;
  paymentMethodIds: string[];
  allowQuotes: boolean;
  maxQuotes: number | null;
  minInitialQuoteValue: number | null;
  paymentItems: AdmissionPaymentItem[];
  discountIds: number[];
  documentIds: number[];
  requirementIds: number[];
  electronicSignature: boolean;
  isProfile: boolean;
  checklistId: number | null;
  convocationChecklists: {
    curriculumOfferingId: number;
    checklistId: number | null;
  }[];
  description: string;
  required: boolean;
}

export interface AdmissionProcess {
  id: string;
  nombre: string;
  periodoAcademico: string;
  estado: AdmissionProcessStatus;
  numeroPasos: number;
  programas: AdmissionProgramPeriod[];
  fechaInicio: string;
  fechaFin: string;
  postulantes: number;
  pasos: AdmissionWorkflowStep[];
  imagen?: string | null;
}

export interface AdmissionProcessStepTypeOption {
  id: string;
  name: string;
  icon: string;
  tone: AdmissionTone;
  sourceId?: number;
}

export interface AdmissionProcessAppliesToOption extends AdmissionSelectOption<AdmissionProcessAppliesTo> {
  icon: string;
  tone: AdmissionTone;
}

export interface AdmissionProcessReferenceData {
  academicPeriods: AdmissionAcademicPeriod[];
  statusOptions: AdmissionSelectOption<AdmissionProcessStatus | 'all'>[];
  stepTypeOptions: AdmissionProcessStepTypeOption[];
  appliesToOptions: AdmissionProcessAppliesToOption[];
  elementsByType: Record<AdmissionProcessStepType, AdmissionElementOption[]>;
}
