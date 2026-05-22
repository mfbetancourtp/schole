import { TimestampDto } from '../../../shared/dto/timestamp.dto';

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
  independentGroupId?: any;
  curriculumProductId?: any;
  teacher?: any;
}

export interface WeekDayDto {
  id: number;
  label: string;
  abbreviation: string;
}
export interface RelatedDataDto {
  courses: CourseDto[];
  weekDays: WeekDayDto[];
}

export interface ScheduleDto extends TimestampDto {
  id: number;
  academicPeriodGroupId: number;
  institutionId: number;
  courseId: number;
  dayWeek: number;
  startTime: string;
  endTime: string;
  nameCourse: string;
  playTimeName: string;
  createdAt: any;
  updatedAt: any;
  color: any;
  playTimeId: number;
  name: string;
  timeSince: string;
  timeUntil: string;
  journeyId: number;
}
