export interface CurriculumOfferingDto {
  id: number;
  academicPeriodId: number;
  campusId?: number;
  programId: number;
  programCurriculumId?: number;
  minCapacity: number;
  maxCapacity: number;
  periodValue?: number;
  campusName?: string;
  programName: string;
  departmentName?: string;
  facultieName?: string;
  programTypeName?: string;
  modalityName: string | null;
  totalCuts?: number;
  directorProgramName?: string;
}

export interface CurriculumPeriodDto {
  id: number;
  programCurriculumId: number;
  name: string;
  code: string;
  description: string | null;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
