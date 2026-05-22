import { TimestampDto } from './timestamp.dto';

export interface GroupDto extends TimestampDto {
  id: number;
  name: string;
  abbreviation: string;
  institutionId: number;
}
