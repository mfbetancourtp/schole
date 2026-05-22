import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ConvocationInscripcionDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  title: string;
  description: string;
  thumbnail: string;
  urlBanner?: any;
  startDate: string;
  endDate: string;
  levelId: number;
  degreeIds: string;
  active: number;
  defaultRoleId: number;
}