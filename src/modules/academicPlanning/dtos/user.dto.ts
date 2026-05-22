import {TimestampDto} from '../../../shared/dto/timestamp.dto';
import { PeopleDto } from './people.dto';

export interface UserDto extends TimestampDto {
    id: number;
    userToken: string;
    password?: any;
    confirmationDate?: any;
    avatar?: any;
    languageKey?: any;
    timeZone?: any;
    people: PeopleDto;
}