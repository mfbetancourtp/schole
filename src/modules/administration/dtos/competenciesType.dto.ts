import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface CompetenciesTypeDto extends TimestampDto {
    id: number;
    institutionId?: number;
    name: string;
    isGeneral?: number;
}