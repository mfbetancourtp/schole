import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface OffenseTemplateDto extends TimestampDto {
  id: number;
  institutionId: number;
  code: string;
  name: string;
  isPositive: number;
  searchName: string;
}
