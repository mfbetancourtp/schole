import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface CurriculumDegreeDto extends TimestampDto {
    id: number;
    institutionId: number;
    curriculumId: number;
    degreeId: number;
    maxSubjectFailed: any;
}