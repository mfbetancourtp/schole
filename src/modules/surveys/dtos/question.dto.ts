import { TimestampDto } from '../../../shared/dto/timestamp.dto';

import { AnswerOptionDto } from './answerOption.dto';

export interface QuestionDto extends TimestampDto {
  id: number;
  institutionId: number;
  text: string;
  questionTypeId: number;
  typeDataId: number;
  required: number;
  defaultAnswerOptionsId: any;
  active: number;
  order: number;
  weight: string | null;
  surveySectionId: number;
  fieldId: number | null;
  fieldDefaultRequired: number;
  rolesIdsBlocked: string;
  bullyingCategoryId: number | null;
  questionType: string;
  typeData: string;
  answerOptions: AnswerOptionDto[];
}
