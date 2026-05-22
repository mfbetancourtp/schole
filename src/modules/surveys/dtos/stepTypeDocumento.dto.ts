import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface EnrolDocumentDto extends TimestampDto {
  id: number;
  institutionId: number;
  code: string;
  documentId: number;
  convocationEnrolId: number;
  convocationEnrolStepId: number;
  urlDocument?: any;
  isAccept: number;
  urlSignedDocument: string;
  urlDocumentWithSigners: string;
  documentKey: string;
  processKey: string;
}

export interface SignerDto extends TimestampDto {
  id: number;
  documentId: number;
  signerTypeId: number;
  relationshipId?: any;
  additionalFields: string;
  code: string;
  description: string;
  isInstitutional: number;
  jsonData?: any;
  assigned: boolean;
  documentSignatureId: number;
}

export interface FileDto {
  file: string;
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
  urlTemplate?: any;
  predefinedFormsIds?: any;
  enrolDocument: EnrolDocumentDto;
  signers: SignerDto[];
  file: FileDto;
}

export interface StepTypeDocumentoDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  convocationId: number;
  convocationStepTypeId: number;
  surveyId?: any;
  order: number;
  allowQuotes?: any;
  maxQuotes: number;
  minInitialQuoteValue: number;
  electronicSignature: number;
  requiresApproval: number;
  notApplyPrevius: number;
  convocationEnrolStepId: number;
  detail: DetailDto[];
}
