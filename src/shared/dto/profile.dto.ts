import { TimestampDto } from './timestamp.dto';

export interface ProfileDto extends TimestampDto {
  id?: number;
  code: string;
  name: string;
  description: string;
  profileId: number;
  profile?: ProfileDto;
}
