import { TimestampDto } from '../../../shared/dto/timestamp.dto';

/**
 * DTO sumario de evaluación (usado en contexto de ejecución)
 * Diferente de EvaluationDto que es la evaluación completa en ApplicationAssessments
 */
export interface EvaluationSummaryDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  name: string;
  description: string;
  evaluationType: string;
  isRequired: boolean;
  templateId: number;
  startDate: string;
  endDate: string;
  assignmentsCount: number;
  status: string;
}

export interface EvaluationExecutionDto extends TimestampDto {
  id: number;
  evaluationId: number;
  userEvaluatorId: number;
  matriculateEvaluatorId: number;
  userEvaluatedId: number;
  offeringSubjectId: number;
  evaluationType: string;
  evaluatorRole: string;
  evaluatedRole: string;
  userEvaluatorProfileCode: string;
  status: 'PENDING' | 'COMPLETED';
  progress: number;
  completedAt?: string;
  evaluation: EvaluationSummaryDto;
  subjectName: string;
  evaluedName: string;
}

export interface EvaluationExecutionPaginationDto {
  data: EvaluationExecutionDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface EvaluatorStatsDto {
  completed: number;
  total: number;
  percentage: number;
}

export interface EvaluatorStatsResponseDto {
  statusCode: number;
  data: EvaluatorStatsDto;
}
