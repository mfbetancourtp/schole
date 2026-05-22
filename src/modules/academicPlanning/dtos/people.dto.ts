import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface PeopleDto extends TimestampDto {
  id: number;
  institutionId: number;
  userId: number;
  lmsUserKey: string;
  identification: string;
  identificationTypeId?: any;
  names: string;
  lastnames: string;
  mobile: string;
  homePhone?: any;
  workPhone?: any;
  email: string;
  homeMunicipalityId?: any;
  direction?: any;
  birthDate?: any;
  birthMunicipalityId?: any;
  nationality?: any;
  genderId?: any;
  religion?: any;
  primaryLanguage?: any;
  zone?: any;
}
