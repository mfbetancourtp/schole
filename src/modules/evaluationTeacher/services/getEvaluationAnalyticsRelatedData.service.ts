import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetEvaluationRelatedDataResponse, GetEvaluationRelatedDataParams } from '../dtos';

/**
 * Servicio para obtener datos relacionados de una evaluación específica (facultades, programas, estadísticas)
 * GET /evaluation-teacher/analytics/evaluations/{id}/related-data
 *
 * Retorna: { evaluation, stats, faculties, programs }
 */
export class GetEvaluationAnalyticsRelatedDataService {
  run(params: GetEvaluationRelatedDataParams, institutionId?: string) {
    const { evaluationId, ...restParams } = params;

    return axios
      .get(`${services.evaluationTeacher}/analytics/evaluations/${evaluationId}/related-data`, {
        params: { ...restParams },
      })
      .then((response) => {
        // axios retorna response.data como el body completo
        // { statusCode: 200, data: { evaluation, stats, faculties, programs } }
        const fullResponse = response.data as GetEvaluationRelatedDataResponse;
        return fullResponse.data;
      });
  }
}
