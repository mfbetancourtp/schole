import { TimestampDto } from '../../../shared/dto/timestamp.dto';
export interface GenderDto extends TimestampDto {
    id: number;
    name: string;
    abbreviation: string;
    institutionId: number;
}