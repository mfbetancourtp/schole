import { TimestampDto } from './timestamp.dto';

export interface PlayTimesDto extends TimestampDto {
  id: number;
  name: string;
  createdAt: string;
  institutionId: number;
  timeSince: string;
  timeUntil: string;
}
