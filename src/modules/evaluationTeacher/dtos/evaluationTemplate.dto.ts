/**
 * DTO para una pregunta dentro de una dimensión de la plantilla de evaluación
 */
export interface EvaluationTemplateQuestionDto {
  id?: number;
  typeQuestion: 'scale' | 'text' | 'multiple';
  evaluationScaleId?: number;
  description: string;
  weight: number;
  isRequired: boolean;
}

/**
 * DTO para una dimensión de la plantilla de evaluación
 */
export interface EvaluationTemplateDimensionDto {
  id?: number;
  name: string;
  description: string;
  weight: number;
  questions: EvaluationTemplateQuestionDto[];
}

/**
 * DTO para crear una nueva plantilla de evaluación
 * POST /evaluation-templates
 */
export interface CreateEvaluationTemplateDto {
  name: string;
  description: string;
  dimensions: EvaluationTemplateDimensionDto[];
}

/**
 * DTO para actualizar una plantilla de evaluación existente
 * PUT /evaluation-templates/:id
 */
export interface UpdateEvaluationTemplateDto extends CreateEvaluationTemplateDto {
  id: number;
}

/**
 * Posibles estados de una plantilla de evaluación
 */
export type EvaluationTemplateStatus = 'draft' | 'published' | 'archived' | 'inactive';

/**
 * DTO de respuesta para una plantilla de evaluación
 */
export interface EvaluationTemplateResponseDto {
  id: number;
  name: string;
  description: string;
  dimensionCount: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  status?: EvaluationTemplateStatus;
  dimensions?: EvaluationTemplateDimensionDto[];
}

/**
 * DTO para la respuesta paginada de plantillas de evaluación
 * GET /evaluation-templates
 */
export interface GetEvaluationTemplatesPaginatedDto {
  data: EvaluationTemplateResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO para las estadísticas de plantillas de evaluación
 * GET /evaluation-templates/stats
 */
export interface GetEvaluationTemplatesStatsDto {
  totalTemplates: number;
  mostUsedTemplate: string | null;
  avgDimensions: number;
  totalQuestions: number;
}

/**
 * Parámetros para obtener plantillas de evaluación paginadas
 * GET /evaluation-templates
 */
export interface GetEvaluationTemplatesParams {
  order?: 'ASC' | 'DESC';
  page?: number;
  noPag?: string;
  perPage?: number;
  search?: string;
  institutionId?: number;
  type?: 'all' | 'recent' | 'oldest' | 'most_used';
  status?: 'draft' | 'published' | 'archived' | 'inactive';
}
