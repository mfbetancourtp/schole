import { TimestampDto } from './timestamp.dto';

export interface JourneyDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  abbreviation: string;
}
