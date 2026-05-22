import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export type TemplateStatus = 'draft' | 'published' | 'archived' | 'inactive';

/**
 * Servicio para actualizar el estado de una plantilla de evaluación
 * PATCH /evaluation-templates/:id/status
 */
export class UpdateEvaluationTemplateStatusService {
  run(id: number, status: TemplateStatus) {
    return axios.patch(`${services.evaluationTeacher}/evaluation-templates/${id}/status`, { status }).then((response) => response.data);
  }
}
