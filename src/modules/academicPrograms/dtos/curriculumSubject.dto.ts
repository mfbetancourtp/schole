import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface CurriculumSubjectDto extends TimestampDto {
    id: number;
    subjectId: number;
    percentArea?: any;
    institutionId: number;
    subjectCategoryId?: any;
    curriculumDegreeId: number;
}