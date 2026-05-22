import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface CourseDataDto extends TimestampDto {
    id: number;
    institutionId: number;
    ownerUserId: number;
    subjectAssignmentId: number;
    code: string;
    name: string;
    description?: any;
    degreeId?: any;
    isTooCourseLMS: number;
    lmsCourseId: number;
}