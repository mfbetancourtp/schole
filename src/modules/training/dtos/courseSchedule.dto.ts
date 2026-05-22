import { TimestampDto } from '../../../shared/dto/timestamp.dto';

// CourseSchedule
export interface AcademicPeriodDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  curriculumId: number;
  calendarTypeId: number;
  startDate: string;
  endDate: string;
  active: number;
}

export interface DegreeDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: string;
  levelId: number;
  name: string;
  abbreviation: string;
}

export interface CourseDto extends TimestampDto {
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
  meetingMunicipalityName: string;
  academicPeriodId: number;
  curriculumSubjectId: number;
  startDate: string;
  endDate: string;
  templateCourseCodeLMS: string;
  lmsInstitutionPlatformId: number;
  categoryIdLMS: number;
  actionInLMS: string;
  isCatalogCourse: number;
  autoInscriptionLMS: number;
  collectOn: string;
  convocationId: number;
  countQuotas: number;
  quota: number;
  isBudget: number;
  numberMonth: number;
  quantityInscriptions: number;
  degree: DegreeDto;
  courseInscriptionId: number;
  sameMunicipality: boolean;
  travelExpenseId: number;
}

export interface CourseScheduleDto {
  id: number;
  label: string;
  abbreviation: string;
  courses: CourseDto[];
}

// CourseScheduleForm
export interface CourseFormDto extends TimestampDto {
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
  templateCourseCodeLMS: string;
  lmsInstitutionPlatformId: number;
  categoryIdLMS: number;
  actionInLMS: string;
  isCatalogCourse: number;
  autoInscriptionLMS: number;
  collectOn: string;
  convocationId: number;
  quota: number;
  isBudget: number;
  numberMonth: number;
  quantityInscriptions: number;
  productUnitValue: number;
  travelExpensesIds: number;
}

export interface CurriculumSubjectDto extends TimestampDto {
  id: number;
  institutionId: number;
  curriculumDegreeId: number;
  code?: any;
  subjectId: number;
  subjectCategoryId?: number;
  percentArea?: number;
  credits?: any;
  hoursPresentWeekly?: any;
  hoursIndependentWorkWeekly?: any;
  hoursPresentWeeklyTotals?: any;
  hoursIndependentWorkWeeklyTotals?: any;
  usePeriods: number;
  useClassroom: number;
  useLMS: number;
  templateCourseCodeLMS?: any;
  categoryIdLMS?: any;
  actionInLMS?: any;
  defaultTemplateCourseCodeLMS?: any;
  defaultCategoryIdLMS?: any;
  defaultActionInLMS?: any;
  order: number;
  subjectName: string;
}

export interface CurriculumDegreeDto extends TimestampDto {
  id: number;
  institutionId: number;
  curriculumId: number;
  degreeId: number;
  maxSubjectFailed: number;
  ratingScaleId: number;
  order: number;
  degreeName: string;
  curriculumSubjects: CurriculumSubjectDto[];
}

export interface CurriculumsWithCurriculumDegreesDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  administrativeResolution: string;
  resolutionDate: string;
  curriculumDegrees: CurriculumDegreeDto[];
}
