import { TimestampDto } from '../../../shared/dto/timestamp.dto';
export interface CalendarTypesDto extends TimestampDto {
    id: number;
    name: string;
    abbreviation: string;
    institutionId: number;
}