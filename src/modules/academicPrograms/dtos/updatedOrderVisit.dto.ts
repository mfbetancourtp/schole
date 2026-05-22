import { AnswerOptionDto } from '../../surveys/dtos/answerOption.dto';

export interface UpdatedOrderVisitDto {
  id: number;
  institutionId: number;
  thumbnail: string;
  levelId: number;
  name: string;
  abbreviation: string;
  maxCredits?: number;
  minCredits?: number;
  order: number;
}
