import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface PeopleDto extends TimestampDto {
  id: number;
  institutionId: number;
  userId: number;
  lmsUserKey: string;
  identification: string;
  identificationTypeId: number;
  firstName?: any;
  secondName?: any;
  secondLastname?: any;
  firstLastname?: any;
  names: string;
  lastnames: string;
  mobile: string;
  homePhone: string;
  workPhone: string;
  email: string;
  homeMunicipalityId: number;
  direction: string;
  birthDate: string;
  birthMunicipalityId: number;
  nationality: string;
  genderId: number;
  religion: string;
  primaryLanguage: string;
}

export interface UserDto extends TimestampDto {
  id: number;
  userToken: string;
  password: string;
  confirmationDate: string;
  avatar?: any;
  languageKey?: any;
  timeZone?: any;
  people: PeopleDto;
}

export interface MedicalRecordDto extends TimestampDto {
  id: number;
  institutionId: number;
  userId: number;
  annotations: string;
  wellnessAreaId: number;
  wellnessAreaName: string;
  consultationDate: string;
  createdBy: number;
  updatedBy: number;
  user: UserDto;
}