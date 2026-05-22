import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface CurriculumDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  administrativeResolution: string;
  resolutionDate: string;
}
