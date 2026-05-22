import { AcademicPeriodDataDto } from '../academicPeriod.dto';

export interface GetAttendanceFilterOptionsDto {
  academicPeriods: AcademicPeriodDataDto[];
  studentCategories: any[];
}
