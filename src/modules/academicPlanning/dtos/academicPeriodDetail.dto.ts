import { TimestampDto } from '../../../shared/dto/timestamp.dto';
import { AcademicPeriodProgramDto } from './academicPeriodProgram.dto';

export interface AcademicPeriodStatisticsDto {
  totalPrograms: number;
  totalQuota: number;
  averageValue: number;
  totalCuts: number;
}

export interface AcademicPeriodDetailDto extends TimestampDto {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  curriculumId: number;
  curriculumName: string;
  calendarTypeId: number;
  calendarTypeName: string;
  active: number;
  statistics: AcademicPeriodStatisticsDto;
  programs: AcademicPeriodProgramDto[];
}
