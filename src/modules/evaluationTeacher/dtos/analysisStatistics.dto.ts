/**
 * DTO para un docente con estadísticas de evaluación
 */
export interface TeacherAnalyticsDto {
  id: string | number;
  name: string;
  department: string;
  course: string;
  averageScore: number;
  responseCount: number;
  responseRate: number;
}

/**
 * DTO para una facultad
 */
export interface FacultyDto {
  id: number;
  name: string;
  count: number;
}

/**
 * DTO para un programa académico
 */
export interface ProgramDto {
  id: number;
  name: string;
  count: number;
}

/**
 * DTO para estadísticas de evaluación
 */
export interface EvaluationStatsDto {
  institutionalAverage: number;
  totalResponses: number;
  responseRate: number;
}

/**
 * DTO para una evaluación en el listado
 */
export interface EvaluationAnalyticsDto {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: string;
  statusLabel?: string;
  academicPeriodId?: number;
  institutionId?: number;
  evaluationType?: string;
  templateId?: number;
  assignmentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * Paginación de respuesta
 */
export interface PaginationDto {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Respuesta para obtener evaluaciones listadas
 * GET /evaluation-teacher/evaluations
 */
export interface GetEvaluationsAnalyticsResponse {
  data: EvaluationAnalyticsDto[];
  pagination?: PaginationDto;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

/**
 * Respuesta para obtener datos relacionados de una evaluación
 * GET /evaluation-teacher/analytics/evaluations/{id}/related-data
 */
export interface GetEvaluationRelatedDataResponse {
  statusCode?: number;
  data: {
    evaluation: EvaluationAnalyticsDto;
    stats: EvaluationStatsDto;
    faculties: FacultyDto[];
    programs: ProgramDto[];
  };
}

/**
 * Respuesta para obtener docentes evaluados con estadísticas
 * GET /evaluation-teacher/analytics/{evaluationId}/evaluated
 */
export interface GetEvaluatedTeachersResponse {
  data: TeacherAnalyticsDto[];
  pagination?: PaginationDto;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

/**
 * Parámetros para obtener evaluaciones en contexto de analytics
 * Nota: Use GetEvaluationsParams from applicationAssessments.dto en su lugar (más moderna)
 * @deprecated Use GetEvaluationsParams from applicationAssessments.dto
 */
export interface GetAnalyticsEvaluationsParams {
  order?: 'ASC' | 'DESC';
  page?: number;
  perPage?: number;
  search?: string;
  institutionId?: number;
}

/**
 * Parámetros para obtener datos relacionados de una evaluación
 */
export interface GetEvaluationRelatedDataParams {
  evaluationId: string | number;
  institutionId?: number;
}

/**
 * Parámetros para obtener docentes evaluados
 */
export interface GetEvaluatedTeachersParams {
  evaluationId: string | number;
  facultyId?: string | number;
  programId?: string | number;
  order?: 'ASC' | 'DESC';
  page?: number;
  perPage?: number;
  institutionId?: number;
}
