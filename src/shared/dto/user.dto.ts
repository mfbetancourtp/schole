import { TimestampDto } from './timestamp.dto';
import { PeopleDto } from './people.dto';

export interface UserDto extends TimestampDto {
  id: number;
  userToken: string;
  avatar: string;
  languageKey: string;
  timeZone: string;
  people: PeopleDto;
  fullName?: string;
  isFirstLogin: number;
}

export interface UserDetailDto extends TimestampDto {
  id: number;
  userToken: string;
  confirmationDate: string;
  avatar: string;
  languageKey: string;
  timeZone: string;
}
