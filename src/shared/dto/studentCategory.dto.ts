import {TimestampDto} from './timestamp.dto';

export interface StudentCategoryDto extends TimestampDto {
    id: number;
    name: string;
    abbreviation: string;
    institutionId: number;
}