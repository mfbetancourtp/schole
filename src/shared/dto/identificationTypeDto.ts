import { TimestampDto } from './timestamp.dto';

export interface IdentificationTypeDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  abbreviation: string;
}
