import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetEvaluationsAnalyticsResponse, GetEvaluationsParams } from '../dtos';

/**
 * Servicio para obtener el listado de evaluaciones con análisis
 * GET /evaluation-teacher/evaluations
 */
export class GetEvaluationsAnalyticsService {
  run(params?: GetEvaluationsParams, institutionId?: string) {
    return axios
      .get(`${services.evaluationTeacher}/evaluations`, {
        params: { order: 'DESC', ...params },
      })
      .then((response) => response.data as GetEvaluationsAnalyticsResponse);
  }
}
