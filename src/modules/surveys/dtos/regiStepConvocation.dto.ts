import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ConvocationDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  title: string;
  description: string;
  thumbnail: string;
  urlBanner: string;
  startDate: string;
  endDate: string;
  levelId: number;
  degreeIds: string;
  active: number;
  defaultRoleId: number;
  userNotification: number;
}
export interface StepDto extends TimestampDto {
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
  notApplyPrevius: number;
  applyOnlyOlds: number;
  applyOnlyNew: number;
  isProfile: number;
  solveAdmin: number;
  electronicSignature: number;
  description: string;
  urlVideoConvocationStep: string;
  ConvocationStepType: ConvocationStepTypeDto;
  isApproved?: number;
  convocationEnrolStepId?: number;
  comments: any[];
  statePayment: any;
  detail?: DetailDto[];
}
export interface ConvocationStepTypeDto {
  id: number;
  name: string;
}
export interface DetailDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  description: string;
  documentBody?: string;
  active?: number;
  prefix: any;
  numberStar?: number;
  numberEnd?: number;
  sizeConsecutive?: number;
  lastNumber?: number;
  urlTemplate?: string;
  predefinedFormsIds?: string;
  formulas?: any[];
  enrolDocument?: EnrolDocumentDto;
  enrolAttachment?: EnrolAttachmentDto;
}
export interface EnrolDocumentDto extends TimestampDto {
  id: number;
  institutionId: number;
  code: any;
  documentId: number;
  convocationEnrolId: number;
  convocationEnrolStepId: number;
  urlDocument: any;
  isAccept: any;
  urlSignedDocument: string;
  urlDocumentWithSigners: any;
  documentKey: any;
  processKey: any;
}
export interface EnrolAttachmentDto extends TimestampDto {
  id: number;
  institutionId: number;
  convocationEnrolId: number;
  convocationEnrolStepId: number;
  requirementId: number;
  urlAttachment: string;
  isAccept?: number;
  title: string;
}

export interface ConvocationWithStepDto extends ConvocationDto {
  steps: StepDto[];
}
