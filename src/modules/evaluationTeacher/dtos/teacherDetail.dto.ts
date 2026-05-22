/**
 * DTO para un indicador de dimensión en el detalle del docente
 */
export interface TeacherDetailDimensionDto {
  id: number;
  name: string;
  score: number;
  weight?: number;
}

/**
 * DTO para una pregunta en la respuesta de dimensiones
 */
export interface TeacherDimensionQuestionDto {
  id: number;
  label: string;
  description?: string;
  weight?: number;
  average: number;
  responses: number;
  color?: string | null;
  stdDev?: number;
}

/**
 * DTO para una dimensión con sus preguntas (desde el endpoint /dimensions)
 */
export interface TeacherDimensionWithQuestionsDto {
  id: number;
  name: string;
  weight?: number;
  score: number;
  questions: TeacherDimensionQuestionDto[];
}

/**
 * DTO para la respuesta de dimensiones del docente
 * GET /evaluation-teacher/analytics/evaluations/{evaluationId}/evaluated/{userId}/dimensions
 */
export interface GetTeacherDimensionsResponse {
  statusCode?: number;
  data: TeacherDimensionWithQuestionsDto[];
}

/**
 * DTO para un indicador detallado de dimensión
 */
export interface TeacherDimensionIndicatorDto {
  id: number;
  name: string;
  description?: string;
  score: number;
  weight?: number;
  questionCount?: number;
  averageScore?: number;
  responseRate?: number;
}

/**
 * DTO para una pregunta en el detalle del docente
 */
export interface TeacherDetailQuestionDto {
  id: number;
  description: string;
  answer?: string;
  score?: number;
  average: number;
  stdDev: number;
  responses: number;
}

/**
 * DTO para una dimensión con sus preguntas (estructura interna)
 */
export interface TeacherDetailDimensionWithQuestionsDto {
  id: number;
  name: string;
  score: number;
  weight?: number;
  questions: TeacherDetailQuestionDto[];
}

/**
 * DTO para la respuesta de indicadores individuales del docente
 * GET /evaluation-teacher/analytics/evaluations/{evaluationId}/evaluated/{userId}
 */
export interface GetTeacherDetailAnalyticsResponse {
  statusCode?: number;
  data: {
    teacher: {
      id: number;
      name: string;
      email?: string;
    };
    evaluation: {
      id: number;
      name: string;
      description?: string;
    };
    statistics: {
      averageScore: number;
      responseCount: number;
      responseRate: number;
      totalQuestions?: number;
    };
    dimensions: TeacherDetailDimensionWithQuestionsDto[];
  };
}

/**
 * DTO para una asignatura del docente
 */
export interface TeacherSubjectDto {
  id: number;
  name: string;
  code?: string;
  average?: number;
  responseCount?: number;
  responseRate?: number;
}

/**
 * DTO para un rol de evaluador
 */
export interface EvaluatorRoleDto {
  key: string;
  label: string;
}

/**
 * DTO para la respuesta de asignaturas del docente
 * GET /evaluation-teacher/analytics/evaluations/{evaluationId}/evaluated/{userId}/subjects
 */
export interface GetTeacherSubjectsResponse {
  statusCode?: number;
  data: {
    teacher: {
      id: number;
      name: string;
    };
    evaluation: {
      id: number;
      name: string;
    };
    subjects: TeacherSubjectDto[];
    evaluatorRoles?: EvaluatorRoleDto[];
  };
}

/**
 * Parámetros para obtener el detalle del docente
 */
export interface GetTeacherDetailParams {
  evaluationId: string | number;
  userId: string | number;
}

/**
 * Parámetros para obtener las dimensiones del docente
 */
export interface GetTeacherDimensionsParams {
  evaluationId: string | number;
  userId: string | number;
  subjectId?: string | number;
  evaluatorRole?: string;
}
