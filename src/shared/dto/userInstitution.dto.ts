import {TimestampDto} from './timestamp.dto';
import {InstitutionDto} from './institution.dto';

export interface UserInstitutionDto extends TimestampDto {
    id: number;
    userId: number;
    institutionId: number;
    active: number;
    identification: string;
    name: string;
    institution: InstitutionDto;
}