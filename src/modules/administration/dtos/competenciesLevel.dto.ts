import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface CompetenciesLevelDto extends TimestampDto {
    id: number;
    institutionId: number;
    name: string;
}