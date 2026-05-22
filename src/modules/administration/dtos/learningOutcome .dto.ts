import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface LearningOutcomeDto extends TimestampDto {
    id: number;
    institutionId: number;
    competencyId: number;
    code: string;
    description: string;
    curriculumId?: any;
    degreeId?: any;
}