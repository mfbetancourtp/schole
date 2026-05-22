import { TimestampDto } from './timestamp.dto';
import { CalendarTypeDto } from './calendarType.dto';
import { CurriculumDto } from './curriculum.dto';
import { PeriodDto } from './period.dto';

export interface AcademicPeriodDto extends TimestampDto {
  id: number | string;
  institutionId: number;
  name: string;
  curriculumId: number;
  calendarTypeId: number;
  startDate: string;
  endDate: string;
  active: number;
  levelId?: number | undefined;
  createdAt: string;
  updatedAt?: any;
  calendarType: CalendarTypeDto;
  curriculum: CurriculumDto;
  periods: PeriodDto[];
}

export interface AcademicPeriodDataDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  curriculumId: number;
  calendarTypeId: number;
  startDate: string;
  endDate: string;
  active: number;
}

export interface SectionsDto {
  BasicInformation: any;
  OutputContacts: any;
  PersonalInformation: any;
  RegistrationInformation: any;
}
