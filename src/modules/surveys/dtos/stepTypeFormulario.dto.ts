import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface AnswerOptionDto {
  id: number;
  questionId: number;
  text: string;
  isOpen: number;
  value: string;
  order: number;
  selected: number;
  detail?: any;
}

export interface QuestionDto extends TimestampDto {
  id: number;
  institutionId: number;
  text: string;
  questionTypeId: number;
  typeDataId: number;
  required: number;
  defaultAnswerOptionsId?: any;
  active: number;
  order: number;
  weight?: any;
  fieldName?: any;
  surveySectionId: number;
  questionType: string;
  blockQuestion: any;
  typeData: string;
  answerOptions: AnswerOptionDto[];
  answer?: any;
  rowId?: any;
}

export interface FieldDto extends TimestampDto {
  id: number;
  institutionId: number;
  predefinedSectionId: number;
  tableFieldId: number;
  showField: number;
  institutionRequired: number;
  label: string;
  defaultLabel: string;
  defaultIsRequired: number;
  keyField: string;
  name: string;
  typeField: string;
}

export interface DetailDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  description?: any;
  urlImgHeader?: any;
  urlImgContent?: any;
  isMatriz: number;
  maxResponses: number;
  minResponses: number;
  responses: any[];
  active: number;
  order: number;
  weight?: any;
  surveyId: number;
  predefinedFormId?: number;
  previousProcedure?: any;
  getProcedure: string;
  saveProcedure: string;
  questions: QuestionDto[];
  fields: FieldDto[];
}

export interface StepTypeFormularioDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  convocationId: number;
  convocationStepTypeId: number;
  surveyId: number;
  order: number;
  allowQuotes?: any;
  maxQuotes: number;
  minInitialQuoteValue: number;
  requiresApproval: number;
  detail: DetailDto[];
}
