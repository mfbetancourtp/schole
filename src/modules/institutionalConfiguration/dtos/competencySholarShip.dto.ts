import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface CompetencySholarShipDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string | undefined;
}
