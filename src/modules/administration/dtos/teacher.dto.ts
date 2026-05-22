import { PeopleDto } from '../../../shared/dto/people.dto';
import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface TeacherDto extends TimestampDto {
    id: number;
    userToken: string;
    password?: any;
    confirmationDate?: any;
    avatar?: any;
    name?: string;
    languageKey?: any;
    timeZone?: any;
    people: PeopleDto;
}