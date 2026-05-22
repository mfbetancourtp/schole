import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface CalendarTypeDto extends TimestampDto {
  id: number;
  name: string;
  abbreviation: string;
  institutionId: number;
}
