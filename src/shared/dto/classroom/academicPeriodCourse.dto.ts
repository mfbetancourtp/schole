import { TimestampDto } from '../timestamp.dto';

export interface AcadPeriLevelCourseDto extends TimestampDto {
  id: number;
  institutionId: number;
  ownerUserId: number;
  subjectAssignmentId: number;
  code: string | null;
  name: string;
  description: string | null;
  degreeId: number | null;
  syncLmsNew: number;
  isTooCourseLMS: number;
  lmsCourseId: number | null;
  independentGroupId: number | null;
  curriculumProductId: number | null;
  academicPeriodBudgetId: number | null;
  meetingMunicipalityId: number | null;
  academicPeriodId: number | null;
  curriculumSubjectId: number | null;
  startDate: string | null;
  endDate: string | null;
  templateCourseCodeLMS: string | null;
  lmsInstitutionPlatformId: number | null;
  categoryIdLMS: number | null;
  actionInLMS: string | null;
  isCatalogCourse: number;
  autoInscriptionLMS: number;
  collectOn: string | null;
  convocationId: number | null;
  quota: number | null;
  periodId: number | null;
  syncOnlyFinalQuality: number;
  createdScheduleCourses: number;
  isBudget: number;
}

export type GetAcadPeriLevelAllCoursesDto = AcadPeriLevelCourseDto[];
