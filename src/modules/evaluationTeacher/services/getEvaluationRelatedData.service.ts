import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

/**
 * Servicio para obtener datos relacionados necesarios al crear/editar evaluaciones
 * GET /evaluations/related-data
 */
export class GetEvaluationRelatedDataService {
  run(institutionId?: string) {
    const url = `${services.evaluationTeacher}/evaluations/related-data`;
    return axios
      .get(url, {
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
