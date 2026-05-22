import { TimestampDto } from '../../../shared/dto/timestamp.dto';
export interface PlayTimeDto extends TimestampDto {
  id: number;
  name: string;
  abbreviation: string;
  institutionId: number;
  timeSince: string;
  timeUntil: string;
  journeyId: number;
  journeyName: string;
}
