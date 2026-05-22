import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetTeacherDetailAnalyticsResponse, GetTeacherDetailParams } from '../dtos';

/**
 * Servicio para obtener los indicadores individuales de un docente evaluado
 * GET /evaluation-teacher/analytics/evaluations/{evaluationId}/evaluated/{userId}
 */
export class GetTeacherDetailAnalyticsService {
  run(params: GetTeacherDetailParams, institutionId?: string) {
    const { evaluationId, userId } = params;

    return axios.get(`${services.evaluationTeacher}/analytics/evaluations/${evaluationId}/evaluated/${userId}`).then((r) => r.data as GetTeacherDetailAnalyticsResponse);
  }
}
