import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface AttendanceFormDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  topicId: number;
  name: string;
  description: string;
  dateSince: string;
  dateUntil: string;
  rowOrder: any;
  planningWeekId: number;
  urlEvidence: string;
  topicIds: number[];
}

export interface AttendanceRelatedDataDto extends TimestampDto {
  courseData: CourseDataDto;
  timetables: TimetableDto[];
  topics: TopicDto[];
}
export interface TopicDto extends TimestampDto {
  id: number;
  institutionId: number;
  code: any;
  courseId: number;
  competencyId: number;
  name: string;
  description: string;
  rowOrder: any;
}
export interface TimetableDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  dayWeek: number;
  startTime: string;
  endTime: string;
}
export interface CourseDataDto extends TimestampDto {
  id: number;
  institutionId: number;
  ownerUserId: number;
  subjectAssignmentId: number;
  code: string;
  name: string;
  description: any;
  degreeId: any;
  isTooCourseLMS: number;
  lmsCourseId: any;
  independentGroupId: any;
  curriculumProductId: any;
  academicPeriodBudgetId: any;
  meetingMunicipalityId: any;
  academicPeriodId: any;
  curriculumSubjectId: any;
  startDate: any;
  endDate: any;
  templateCourseCodeLMS: any;
  lmsInstitutionPlatformId: any;
  categoryIdLMS: any;
  actionInLMS: any;
  isCatalogCourse: number;
  autoInscriptionLMS: number;
  collectOn: any;
  convocationId: any;
  quota: any;
  isBudget: number;
  productUnitValue: any;
}
