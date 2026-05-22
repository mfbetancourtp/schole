export type StatusScholarship = 'Borrador' | 'Activa' | 'Cerrado';

export interface ScholarshipSettingFacultyDto {
  id: number;
  faculty: { id: number; name: string };
}

export interface ScholarshipSettingProgramDto {
  id: number;
  program: { id: number; name: string };
}

export interface ScholarshipSettingDto {
  id: number;
  name: string;
  code: string;
  typeScholarshipId: number;
  typeScholarship?: { id: number; name: string; abbreviation?: string };
  academicPeriodId: number;
  academicPeriod?: { id: number; name: string };
  statusScholarship: StatusScholarship;
  academicLevelId: number;
  academicLevel?: { id: number; name: string };
  faculties?: ScholarshipSettingFacultyDto[];
  programs?: ScholarshipSettingProgramDto[];
  studentTypeId: number | null;
  studentType?: { id: number; name: string } | null;
  enrollmentPercentage: boolean;
  fixedValue: boolean;
  percentage: number;
  MaximumAmount: number;
  benefitDuration: number;
  capacity: number;
  totalBudget: number;
  startDate: string;
  endDate: string;
  publicationDate: string;
  photoUrl: string | null;
}

export interface ScholarshipSettingPaginatedDto {
  data: ScholarshipSettingDto[];
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    pages: number;
  };
}

export interface ScholarshipSettingSummaryDto {
  total: number;
  totalActiva: number;
  totalBorrador: number;
  totalCapacity: number;
}

export interface CreateOrUpdateScholarshipSettingDto {
  name: string;
  code: string;
  typeScholarshipId: number;
  academicPeriodId: number;
  statusScholarship: StatusScholarship;
  academicLevelId: number;
  facultyIds?: number[];
  programIds?: number[];
  studentTypeId?: number | null;
  enrollmentPercentage: boolean;
  fixedValue: boolean;
  percentage: number;
  MaximumAmount: number;
  benefitDuration: number;
  capacity: number;
  totalBudget: number;
  startDate: string;
  endDate: string;
  publicationDate: string;
  photoUrl?: string | null;
}
