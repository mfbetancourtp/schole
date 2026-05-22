import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetEvaluationTemplatesStatsDto } from '../dtos/evaluationTemplate.dto';

/**
 * Servicio para obtener estadísticas globales de las plantillas de evaluación
 * GET /evaluation-templates/stats
 */
export class GetEvaluationTemplatesStatsService {
  run(institutionId?: string) {
    return axios
      .get(`${services.evaluationTeacher}/evaluation-templates/stats`, {
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
