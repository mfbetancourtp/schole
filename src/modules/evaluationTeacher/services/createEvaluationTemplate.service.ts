import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CreateEvaluationTemplateDto, EvaluationTemplateResponseDto } from '../dtos/evaluationTemplate.dto';

/**
 * Servicio para crear una nueva plantilla de evaluación
 * POST /evaluation-templates
 */
export class CreateEvaluationTemplateService {
  run(data: CreateEvaluationTemplateDto, institutionId?: string) {
    return axios
      .post(`${services.evaluationTeacher}/evaluation-templates`, data, {
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
