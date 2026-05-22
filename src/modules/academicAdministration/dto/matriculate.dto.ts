import { StudentDataDto, StudentDto } from './student.dto';
import { TimestampDto } from '../../../shared/dto/timestamp.dto';
import { AcademicPeriodGroupDataDto, AcademicPeriodGroupDto } from './academicPeriodGroup.dto';

export interface MatriculateDto extends TimestampDto {
  id: number | null;
  institutionId?: number;
  academicPeriodGroupId?: number | null;
  studentId?: number;
  registeredDate?: string;
  isRetired?: number;
  isPreEnrolled?: number;
  retiredDate?: any;
  isApproved?: number;
  student: StudentDto;
  academicPeriodGroup?: AcademicPeriodGroupDto;
  studentCategoryId?: number;
}

export interface MatriculateDetailDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodGroupId: number;
  studentId: number;
  studentCategoryId?: number;
  registeredDate: string;
  isRetired: number;
  reasonRetired: string;
  retiredDate: string;
  ignorePeriodIds: string;
  isApproved: number;
  isPreEnrolled: number;
  deleteAt: string;
  student: StudentDataDto;
  academicPeriodGroup: AcademicPeriodGroupDataDto;
  isQualitativeGrading: number;
  useQualitativeGradingRules: number;
  userId: number;
  names: string;
  lastnames: string;
  activeUserInstitution: number;
}
