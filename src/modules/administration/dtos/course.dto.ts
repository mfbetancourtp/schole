import { TimestampDto } from '../../../shared/dto/timestamp.dto';
import { TeacherDto } from './teacherForCourseDto.dto';
import { SubjectDto } from './subject.dto';

export interface CourseDto extends TimestampDto {
  id: number;
  institutionId: number;
  ownerUserId: number;
  subjectAssignmentId: number;
  code: string | null;
  name: string;
  description?: any;
  degreeId?: any | null;
  isTooCourseLMS: number;
  lmsCourseId?: number | null;
  createdAt: string;
  updatedAt: string;
  academicPeriodGroupId: number;
  subject: SubjectDto;
  teacher: TeacherDto;
  degreeName: string;
  groupName: string;
  level: any;
}

export interface CourseDetailDto extends TimestampDto {
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
  academicPeriodGroupId: number;
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
  convocationId: any;
  quota: any;
  isBudget: number;
  productUnitValue: any;
  ratingScales: any;
  level: any;
}
