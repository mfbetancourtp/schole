import { TimestampDto } from './timestamp.dto';

export interface CalendarTypeDto extends TimestampDto {
    id: number;
    name: string;
    abbreviation: string;
    institutionId: number;
}