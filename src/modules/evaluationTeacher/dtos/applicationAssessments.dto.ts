import { TimestampDto } from '../../../shared/dto/timestamp.dto';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

/**
 * Estados de una evaluación
 */
export enum EvaluationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  INACTIVE = 'inactive',
  FINISHED = 'finished',
  CLOSED = 'closed',
  ACTIVE = 'active',
}

/**
 * Tipos de evaluación
 */
export enum EvaluationType {
  EVALUATION_360 = 'EVALUATION_360',
  SELF_EVALUATION = 'SELF_EVALUATION',
  PEER_EVALUATION = 'PEER_EVALUATION',
  MANAGER_EVALUATION = 'MANAGER_EVALUATION',
}

/**
 * Rol de evaluador
 */
export enum EvaluatorRole {
  MANAGER = 'MANAGER',
  PEER = 'PEER',
  SELF = 'SELF',
  STUDENT = 'STUDENT',
  EXTERNAL = 'EXTERNAL',
}

/**
 * Estado de ejecución de evaluación
 */
export enum ExecutionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
}

/**
 * Mapeo de etiquetas de estado para mostrar en UI
 */
export const STATUS_LABELS: Record<EvaluationStatus | string, string> = {
  [EvaluationStatus.DRAFT]: 'Borrador',
  [EvaluationStatus.PUBLISHED]: 'Publicada',
  [EvaluationStatus.ACTIVE]: 'Activa',
  [EvaluationStatus.INACTIVE]: 'Inactiva',
  [EvaluationStatus.FINISHED]: 'Finalizada',
  [EvaluationStatus.CLOSED]: 'Cerrada',
};

/**
 * Estados permitidos para pestaña Activas
 */
export const ACTIVE_TAB_STATUSES = [EvaluationStatus.PUBLISHED, EvaluationStatus.ACTIVE];

/**
 * Estados permitidos para pestaña Finalizadas
 */
export const FINISHED_TAB_STATUSES = [EvaluationStatus.FINISHED, EvaluationStatus.INACTIVE, EvaluationStatus.CLOSED];

/**
 * Estados permitidos para pestaña Borradores
 */
export const DRAFT_TAB_STATUSES = [EvaluationStatus.DRAFT];

/**
 * DTO para una evaluación docente (Aplicación de Evaluaciones)
 */
export interface EvaluationDto extends TimestampDto {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalResponses?: number;
  totalStudents?: number;
  teachersAssigned?: number;
  status?: string;
  statusLabel?: string;
  assignedTeachersCount?: number;
  completedResponses?: number;
  totalExpectedResponses?: number;
  participationRate?: number;
}

/**
 * Tipo para una pregunta de evaluación
 */
export interface IQuestion {
  id?: string;
  text: string;
  type: 'scale' | 'text' | 'multiple';
  options?: string[];
}

/**
 * Tipo para compatibilidad hacia atrás
 * @deprecated Usar EvaluationDto en su lugar
 */
export type ITeacherEvaluation = EvaluationDto;

/**
 * Parámetros para obtener listado de evaluaciones
 * GET /evaluation-teacher/evaluations
 */
export interface GetEvaluationsParams extends ParamsPaginationDto {
  search?: string;
  status?: 'published' | 'inactive' | 'draft' | null;
  institutionId?: number;
  order?: 'ASC' | 'DESC';
}

/**
 * Parámetros para obtener resumen del dashboard
 * GET /evaluation-teacher/evaluations/dashboard/summary
 */
export interface GetDashboardSummaryParams {
  institutionId: number;
}

/**
 * DTO para el resumen del dashboard de Aplicación de Evaluaciones
 * GET /evaluation-teacher/evaluations/dashboard/summary
 */
export interface DashboardSummaryDto {
  activeEvaluations: number;
  totalResponses: number;
  totalResponsesGrowth?: number;
  participationRate: number;
  participationRateGrowth?: number;
}

/**
 * DTO para una tarjeta de estadísticas en el dashboard
 */
export interface DashboardCardDto {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

/**
 * Respuesta completa del resumen del dashboard
 */
export interface GetDashboardSummaryResponse {
  statusCode: number;
  data: DashboardSummaryDto;
}

/**
 * DTO para datos de participación estudiantil en evaluaciones
 * GET /evaluation-teacher/evaluations/dashboard/student-participation
 */
export interface StudentParticipationDto {
  completed: number;
  pending: number;
  total: number;
  completedPercentage: number;
  pendingPercentage: number;
}

/**
 * Respuesta completa para participación estudiantil
 */
export interface GetStudentParticipationResponse {
  statusCode: number;
  data: StudentParticipationDto;
}
