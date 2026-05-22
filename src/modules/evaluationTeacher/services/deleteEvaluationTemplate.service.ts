import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

/**
 * Servicio para eliminar una plantilla de evaluación
 * DELETE /evaluation-templates/:id
 */
export class DeleteEvaluationTemplateService {
  run(id: number) {
    return axios.delete(`${services.evaluationTeacher}/evaluation-templates/${id}`).then((response) => response.data);
  }
}
