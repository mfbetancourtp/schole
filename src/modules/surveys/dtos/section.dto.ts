import { TimestampDto } from '../../../shared/dto/timestamp.dto';

import { QuestionDto } from './question.dto';

export interface SectionDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  description: string;
  urlImgHeader: string | null;
  urlImgContent: string | null;
  isMatriz: number | boolean;
  maxResponses: number;
  minResponses: number;
  active: number;
  order: number;
  weight: string | null;
  surveyId: number;
  questions: QuestionDto[];
  predefinedFormId: number;
  defaultBullyingCategoryId: number | null;
  bullyingCategoryThreshold: number | null;
  previousProcedure: string | null;
  getProcedure: string | null;
  saveProcedure: string | null;
}
