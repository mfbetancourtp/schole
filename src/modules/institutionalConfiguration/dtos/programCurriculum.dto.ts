import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ProgramCurriculumModalityTypeDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  description: string | null;
  deletedAt?: string | null;
}

export interface ProgramCurriculumSubjectDto extends TimestampDto {
  id: number;
  institutionId: number;
  areaId: number | null;
  name: string;
  code: string | null;
  description: string | null;
  shortName: string | null;
  credits: number | null;
  theoricalHours: number | null;
  practicalHours: number | null;
  maximumHours: number | null;
  subjectCategoryId: number | null;
  spaceTypeId: number | null;
  isDegreeRequirement: number | boolean;
  allPrograms?: number | boolean;
  deletedAt?: string | null;
  competencies?: any[];
}

export interface ProgramCurriculumPeriodSubjectDto extends TimestampDto {
  id: number;
  curriculumPeriodId: number;
  subjectId: number;
  deletedAt?: string | null;
  subject?: ProgramCurriculumSubjectDto;
  prerequisites?: ProgramCurriculumSubjectDto[];
}

export interface ProgramCurriculumPeriodDto extends TimestampDto {
  id: number;
  programCurriculumId: number;
  name: string;
  code: string;
  description: string | null;
  state: string;
  deletedAt?: string | null;
  periodSubjects?: ProgramCurriculumPeriodSubjectDto[];
}

export interface ProgramCurriculumDto extends TimestampDto {
  id: number;
  programId: number;
  modalityTypeId: number | null;
  name: string;
  code: string;
  description: string;
  qualifiedRegistration: string;
  internalRegistration: string;
  version: string;
  startDate: string;
  endDate: string | null;
  state: string;
  deletedAt?: string | null;
  modalityType?: ProgramCurriculumModalityTypeDto;
  curriculumPeriods?: ProgramCurriculumPeriodDto[];
  semesterNumber?: number | null;
  subjectNumber?: number | null;
  totalCredits?: number | null;
}
