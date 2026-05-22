import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface ActivityClassificationDto extends TimestampDto {
    id: number;
    institutionId: number;
    courseId: number;
    degreeId?: any;
    abbreviation: string;
    name: string;
    percent: number;
    createdAt?: any;
    updatedAt: string;
}