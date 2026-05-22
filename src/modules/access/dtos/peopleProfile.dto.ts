import { MunicipalityDto } from "../../../shared/dto/municipality.dto";
import { TimestampDto } from "../../../shared/dto/timestamp.dto";
import { GenderDto } from "./gender.dto";
import { IdentificationTypeDto } from "./identificationType.dto";
import { StudentDto } from "./studentProfile.dto";

export interface PeopleDto extends TimestampDto {
    id: number;
    institutionId: number;
    userId: number;
    lmsUserKey?: any;
    identification: string;
    identificationTypeId: number;
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
    identificationType: IdentificationTypeDto;
    gender: GenderDto;
    birthMunicipality: MunicipalityDto;
    homeMunicipality: MunicipalityDto;
    student: StudentDto;
}
