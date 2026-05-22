import { TimestampDto } from '../../../shared/dto/timestamp.dto';
export interface CompetencyLevelDto extends TimestampDto {
    id: number;
    institutionId: number;
    name: string;
}