import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ActivityCategoryDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  degreeId: number;
  abbreviation: string;
  name: string;
  percent: number;
  periodId: number;
  academicPeriodId: number;
  isGeneral: number;
}

export interface ActivityCategoriesListDto {
  academicPeriod: string;
  data: ActivityCategoryDto[];
  withOutAcademicWithOutPeriodWithPeriod: string;
}
