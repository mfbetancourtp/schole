import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface UserDataDto {
  isUserCreate: boolean;
  user: UserDto;
  people: PeopleDto;
  roles: number[];
  institutionId: number;
  lastMatriculate: MatriculateDto | null;
  lastMatriculatesChildren: LastMatriculatesChildrenDto[];
}
export interface UserDto {
  id: number;
  username: string;
}
export interface PeopleDto {
  id: number;
  identification: string;
  email: string;
  mobile: string;
  names: string;
  lastnames: string;
}
export interface MatriculateDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodGroupId: number;
  studentId: number;
  studentCategoryId: any;
  registeredDate: string;
  isRetired: number;
  reasonRetired: any;
  retiredDate: any;
  ignorePeriodIds: any;
  isApproved: any;
  isPreEnrolled: number;
  deleteAt: any;
}
export interface LastMatriculatesChildrenDto extends MatriculateDto {
  studentName: string;
}
