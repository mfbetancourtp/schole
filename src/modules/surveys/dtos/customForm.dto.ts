import { TimestampDto } from '../../../shared/dto/timestamp.dto';

import { SectionDto } from './section.dto';

export interface CustomFormDto extends TimestampDto {
  id: number;
  institutionId: number;
  applicationId: number;
  title: string;
  description: string;
  urlImgHeader: string | null;
  startDate: string | null;
  endDate: string | null;
  active: number;
  order: number;
  weight: string | null;
  surveyType: string | null;
  bullyingTarget: string | null;
  sections: SectionDto[];
  isCustomFieldSurvey: number;
}

export interface ParamsFormCustomFormDto {
  title: string;
  description: string;
  isCustomFieldSurvey: number | boolean;
  thumbnail?: string;
}
