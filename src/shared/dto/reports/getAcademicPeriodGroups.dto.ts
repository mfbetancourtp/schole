import { NamedAbbreviationDto } from '../namedAbbreviation.dto';
import { TimestampDto } from '../timestamp.dto';

export interface AcademicPeriodGroupDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  degreeId: number;
  journeyId: number;
  campusId: number | null;
  groupId: number;
  directorPeopleId: number;
  quota: number;
  playTimeIds: string;
  name: string;
  journey: NamedAbbreviationDto;
  level: NamedAbbreviationDto;
}

export type GetAcademicPeriodGroupsDto = AcademicPeriodGroupDto[];
