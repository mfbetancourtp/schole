import {TimestampDto} from '../../../shared/dto/timestamp.dto';
import { PeopleDto } from '../../academicPlanning/dtos/people.dto';

export interface StudentDto extends TimestampDto{
    id: number;
    userToken: string;
    password?: any;
    confirmationDate?: any;
    avatar?: any;
    languageKey?: any;
    timeZone?: any;
    createdAt: string;
    updatedAt?: any;
    people: PeopleDto;
}
