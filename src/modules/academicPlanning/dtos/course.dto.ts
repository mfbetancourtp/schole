import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface CourseDto extends TimestampDto {
    id: number;
    institutionId: number;
    ownerUserId: number;
    subjectAssignmentId: number;
    code?: any;
    name: string;
    description?: any;
    degreeId?: any;
    isTooCourseLMS: number;
    lmsCourseId?: any;
}