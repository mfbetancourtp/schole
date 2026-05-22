import { AcademicPeriodDataDto, AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { PeopleDto } from '../../../shared/dto/people.dto';
import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface AcademicPeriodGroupDto {
  id: number;
  institutionId?: number;
  directorPeopleId?: number;
  quota?: number;
  directorPeople?: PeopleDto;
  academicPeriod: AcademicPeriodDto;
}

export interface AcademicPeriodGroupDataDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  degreeId: number;
  journeyId: number;
  groupId: number;
  directorPeopleId: number;
  quota: number;
  academicPeriod: AcademicPeriodDataDto;
  courseName: string;
}
