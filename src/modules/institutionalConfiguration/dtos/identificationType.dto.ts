import { TimestampDto } from '../../../shared/dto/timestamp.dto';
export interface IdentificationTypeDto extends TimestampDto {
    id: number;
    name: string;
    abbreviation: string;
    institutionId: number;
}