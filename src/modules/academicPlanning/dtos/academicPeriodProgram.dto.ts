import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface AcademicPeriodProgramDto extends TimestampDto {
  id: number;
  academicPeriodId: number;
  programId: number;
  programName: string;
  programTypeId?: number;
  programTypeName?: string;
  totalQuota: number;
  averageValue: number;
  cutCount: number;
  active: number;
}

export interface ProgramCutDto extends TimestampDto {
  id: number;
  academicPeriodProgramId: number;
  name: string;
  startDate: string;
  endDate: string;
  percentage: number;
  order: number;
  active: number;
}

export interface ProgramConfigurationDto {
  programId: number;
  academicPeriodId: number;
  totalQuota: number;
  averageValue: number;
  cuts: ProgramCutDto[];
}

// DTO para la lista de períodos académicos (mockup)
export interface AcademicPeriodListItemDto {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Activo' | 'Borrador' | 'Cerrado';
  programType: string;
  programCount: number;
}
