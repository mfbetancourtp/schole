import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { EvaluationTemplateResponseDto } from '../dtos/evaluationTemplate.dto';

/**
 * Servicio para obtener una plantilla de evaluación por ID
 * GET /evaluation-templates/:id
 */
export class GetEvaluationTemplateByIdService {
  run(id: number) {
    return axios.get(`${services.evaluationTeacher}/evaluation-templates/${id}`).then((response) => response.data.data || response.data);
  }
}
