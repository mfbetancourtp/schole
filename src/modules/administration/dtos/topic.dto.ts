import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface TopicDto extends TimestampDto {
    id: number;
    institutionId: number;
    courseId?: any;
    competencyId: number;
    name: string;
    description: string;
    rowOrder?: any;
}