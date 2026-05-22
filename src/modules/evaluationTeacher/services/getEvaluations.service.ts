import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetEvaluationsParams } from '../dtos/applicationAssessments.dto';

/**
 * Servicio para obtener evaluaciones (listado/paginado)
 * GET /evaluation-teacher/evaluations
 */
export class GetEvaluationsService {
  run(params?: GetEvaluationsParams, institutionId?: string) {
    return axios
      .get(`${services.evaluationTeacher}/evaluations`, {
        params: { order: 'DESC', ...params },
      })
      .then((response) => response.data);
  }
}
