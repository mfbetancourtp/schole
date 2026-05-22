import {TimestampDto} from './timestamp.dto';

export interface LanguageDto extends TimestampDto {
    id: number;
    name: string;
    key: string;
    isActive: number;
}