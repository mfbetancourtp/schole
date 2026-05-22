import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface CourseTrackingDto {
  id: number;
  label: string;
  abbreviation: string;
  courses: CourseDto[];
}

export interface DegreeDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: string;
  levelId: number;
  name: string;
  abbreviation: string;
}

export interface SessionesDto {
  quantityScheduledSessions: number;
  quantityWithListCallSessions: number;
}

export interface ViaticsDto {
  companyContribution: number;
  finalCompanyContribution: number;
}

export interface BudgetsDto {
  budgetTotalValue: number;
  finalTotalValue: number;
}

export interface CourseDto {
  id: number;
  institutionId: number;
  ownerUserId: number;
  subjectAssignmentId: number;
  code: null | string;
  name: string;
  description: null | string;
  degreeId: null | number;
  isTooCourseLMS: number;
  lmsCourseId: null | number;
  independentGroupId: null | number;
  curriculumProductId: null | number;
  academicPeriodBudgetId: null | number;
  meetingMunicipalityId: number;
  academicPeriodId: number;
  curriculumSubjectId: null | number;
  startDate: string;
  endDate: string;
  templateCourseCodeLMS: null | string;
  lmsInstitutionPlatformId: null | number;
  categoryIdLMS: null | number;
  actionInLMS: null | number;
  isCatalogCourse: number;
  autoInscriptionLMS: number;
  collectOn: null | string;
  convocationId: null | number;
  createdAt: string;
  quota: null | number;
  updatedAt: string;
  isBudget: number;
  numberMonth: number;
  degree: DegreeDto;
  Sessiones: SessionesDto;
  Viatics: ViaticsDto;
  Budgets: BudgetsDto;
}
