import { PeopleDetailDto, PeopleDto } from '../../../shared/dto/people.dto';
import { SurveySectionFieldsDto } from '../../../shared/dto/survey.dto';
import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface StudentDto extends TimestampDto {
  id: number;
  institutionId: number;
  peopleId: number;
  people: PeopleDto;
  code: string;
  codeMEN: string;
}

export interface StudentDataDto extends TimestampDto {
  id: number;
  institutionId: number;
  peopleId: number;
  code: string;
  codeMEN: string;
  people: PeopleDetailDto;
}

export interface StudentDataWithCustomFieldsDto extends StudentDataDto {
  customFields: SurveySectionFieldsDto[];
}
