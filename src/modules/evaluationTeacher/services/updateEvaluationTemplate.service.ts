import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { UpdateEvaluationTemplateDto, EvaluationTemplateResponseDto } from '../dtos/evaluationTemplate.dto';

/**
 * Servicio para actualizar una plantilla de evaluación existente
 * PUT /evaluation-templates/:id
 */
export class UpdateEvaluationTemplateService {
  run(id: number, data: UpdateEvaluationTemplateDto) {
    return axios.put(`${services.evaluationTeacher}/evaluation-templates/${id}`, data).then((response) => response.data);
  }
}
