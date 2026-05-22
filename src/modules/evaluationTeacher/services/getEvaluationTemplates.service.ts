import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetEvaluationTemplatesPaginatedDto, GetEvaluationTemplatesParams } from '../dtos/evaluationTemplate.dto';

/**
 * Servicio para obtener plantillas de evaluación paginadas
 * GET /evaluation-templates
 */
export class GetEvaluationTemplatesService {
  run(params?: GetEvaluationTemplatesParams, institutionId?: string) {
    return axios
      .get(`${services.evaluationTeacher}/evaluation-templates`, {
        params,
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
