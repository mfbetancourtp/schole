import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface RelatedDataDto {
  courseData: CourseDataDto;
  periods: PeriodDto[];
}

export interface CourseDataDto extends TimestampDto {
  id: number;
  institutionId: number;
  ownerUserId: number;
  subjectAssignmentId: number;
  code: string;
  name: string;
  description: string;
  degreeId: number;
  isTooCourseLMS: number;
  lmsCourseId: number;
  independentGroupId: number;
  curriculumProductId: number;
  academicPeriodBudgetId: number;
  meetingMunicipalityId: number;
  academicPeriodId: number;
  curriculumSubjectId: number;
  startDate: string;
  endDate: string;
  templateCourseCodeLMS: any;
  lmsInstitutionPlatformId: any;
  categoryIdLMS: any;
  actionInLMS: any;
  isCatalogCourse: number;
  autoInscriptionLMS: number;
  collectOn: any;
  convocationId: number;
  quota: number;
  isBudget: number;
  productUnitValue: any;
}

export interface PeriodDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  name: string;
  abbreviation: string;
  startDate: string;
  endDate: string;
  percent: number;
  percentRepproved: any;
  order: any;
  active: number;
}

// --------------------------------------------------
export interface MonitoringReportDto {
  url: string;
  courseName: string;
  period: string;
  quantityLearningOutcomes: number;
  quantityLearningOutcomesEvaluated: number;
  quantityTopics: number;
  quantityTopicsEvaluated: number;
  percentageLearningOutcomes: string;
  percentageTopics: string;
  consolidates: ConsolidateDto[];
}

export interface ConsolidateDto {
  numberWeek: number;
  day: string;
  topic: string;
  topics: string[];
  learningOutcomes: string[];
  activities: string[];
}
