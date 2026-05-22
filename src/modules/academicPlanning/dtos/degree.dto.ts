import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface DegreeDto extends TimestampDto {
    id: number;
    institutionId: number;
    thumbnail: string;
    levelId: number;
    name: string;
    abbreviation: string;
    codeLevel: string;
}