import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface StudyPlanDto extends TimestampDto {
    id: number;
    name: string;
    institutionId: number;
    resolutionDate: any;
    administrativeResolution: string;
}