import { TimestampDto } from '../../../../shared/dto/timestamp.dto';

export interface CurriculumsDto extends TimestampDto {
  id?: number;
  name: string;
  administrativeResolution: string;
  resolutionDate: string;
  // levelId: number;
}
