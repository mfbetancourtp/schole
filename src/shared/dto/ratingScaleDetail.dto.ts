import { TimestampDto } from './timestamp.dto';

export interface RatingScaleDetailDto extends TimestampDto {
  id: number;
  ratingScaleId: number;
  abbreviation: string;
  description: string;
  minimumValue: number;
  maximumValue: number;
  lowScale: number;
  urlImage: string | null;
  systemScaleId: number;
  detail: string;
  isImprovement: number;
  color: string;
  codeSystemScale: string;
  ruleGroup: string;
}
