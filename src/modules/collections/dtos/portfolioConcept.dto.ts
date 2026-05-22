import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface PortfolioConceptDto extends TimestampDto {
  id: number;
  institutionId: number;
  slug?: any;
  code: string;
  thumbnail?: any;
  title: string;
  levelId?: any;
  degreeId?: any;
  subjectId?: any;
  description?: any;
  index?: any;
  productTypeId: number;
  defaultUnitValue: number;
  validityPeriod: number;
  checked?: boolean;
}
