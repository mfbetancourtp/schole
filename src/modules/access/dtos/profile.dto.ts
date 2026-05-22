import {TimestampDto} from '../../../shared/dto/timestamp.dto';
import { PeopleDto } from './peopleProfile.dto';

export interface ProfileDto extends TimestampDto {
    id: number;
    userToken: string;
    password?: any;
    confirmationDate: string;
    avatar?: any;
    languageKey?: any;
    timeZone?: any;
    createdAt: string;
    updatedAt?: any;
    people: PeopleDto;
    isConvocation: any;
    roles: string[];
}