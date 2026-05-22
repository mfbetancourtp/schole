import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ConvocationStepDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  convocationId: number;
  convocationStepTypeId: number;
  surveyId?: number;
  order: number;
  allowQuotes?: number;
  maxQuotes?: number;
  minInitialQuoteValue?: number;
  requiresApproval: number;
  notApplyPrevius?: number;
  applyOnlyOlds: number;
  isProfile: number;
  solveAdmin: number;
  applyOnlyNew: number;
  urlVideoConvocationStep?: string | null;
  paymentMethodId?: number | null;
  paymentMethodIds?: number[] | null;
  description?: string | null;
  electronicSignature?: number;
  checklistId?: number | null;
}

export interface ConvocationStepTypeDto {
  id: number;
  name: string;
}

export interface FieldDto {
  surveySectionId: number;
  label: string;
}

export interface DetailDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  description: string;
  documentBody: string;
  active: number;
  prefix: string;
  numberStar: number;
  numberEnd: number;
  sizeConsecutive: number;
  lastNumber: number;
  urlTemplate: string;
  predefinedFormsIds: string;
  formulas: any[];
  isOptional?: number;
  code: string;
  defaultUnitValue?: number;
  productId?: number;
  urlImgHeader?: any;
  urlImgContent?: any;
  isMatriz?: number;
  maxResponses?: number;
  minResponses?: number;
  order?: number;
  weight?: any;
  surveyId?: number;
  predefinedFormId?: number;
  fields: FieldDto[];
  // examen de evaluación
  curriculumOfferingId?: number;
  checklistId?: number | null;
  checklistTitle?: string;
  programName?: string;
  campusName?: string;
}
export interface ConvocationStepForConfigureStepsDto extends ConvocationStepDto {
  ConvocationStepType: ConvocationStepTypeDto;
  details: DetailDto[];
  discountIds: number[];
  convocationChecklists?: {
    curriculumOfferingId: number;
    checklistId: number | null;
  }[];
}
