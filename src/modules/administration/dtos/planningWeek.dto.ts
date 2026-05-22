import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface PlanningWeek2Dto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  periodId: number;
  title: string;
  starDate: string;
  endDate: string;
  isApproved: number;
  range: string;
  numberCompetencies: number;
  numberTopics: number;
  numberSessions: number;
  numberActivities: number;
  numberComments: number;
  periodName: string;
  learningOutcomeDescription: string;
}

export interface PlanningWeekDto extends TimestampDto {
  id: number;
  institutionId: number;
  ownerUserId: number;
  subjectAssignmentId: number;
  code: string;
  name: string;
  title: string;
  description: string;
  degreeId: number;
  isTooCourseLMS: number;
  lmsCourseId?: any;
  independentGroupId?: any;
  curriculumProductId?: any;
  subjectName: string;
  planningWeeks: PlanningWeek2Dto[];
}

export interface CourseDataDto {
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
  createdAt?: any;
  updatedAt: string;
  subjectName: string;
  teacherName: string;
}

export interface RangeDto {
  label: string;
  value: string;
}
export interface PeriodIdDto {
  id: number;
  name: string;
}

export interface RelatedDataDto {
  courseData: CourseDataDto;
  periods: PeriodIdDto[];
  ranges: RangeDto[];
}

// PlanningWeekWithDetailDto

export interface ActivityDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  activityCategoryId?: any;
  topicId?: any;
  periodId?: any;
  name: string;
  description: string;
  attachmentUrl?: any;
  dateSince: string;
  dateUntil: string;
  rowOrder?: any;
  deliveryMaxNumberFiles?: any;
  deliveryFormatFiles?: any;
  lmsActivityId?: any;
  planningWeekId: number;
  isPublish: number;
}

export interface SessionDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  topicId?: number;
  name: string;
  description: string;
  dateSince: string;
  dateUntil: string;
  rowOrder?: any;
  planningWeekId: number;
  topicName: string;
  dateName: string;
  topics: any[];
}

export interface CompetencyDto extends TimestampDto {
  id: number;
  institutionId: number;
  competencyLevelId: number;
  competencyTypeId: number;
  code: string;
  description: string;
  curriculumSubjectId: number;
  degreeId: number;
  percentage: number;
  planningWeekId: number;
  numberTopics: number;
}

export interface PlanningWeekWithDetailDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  periodId: number;
  title: string;
  starDate: string;
  endDate: string;
  isApproved: number;
  range: 'day' | 'week' | 'month';
  competencies: CompetencyDto[];
  sessions: SessionDto[];
  activities: ActivityDto[];
  comments: any[];
}
