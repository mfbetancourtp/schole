import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetTeacherDimensionsResponse, GetTeacherDimensionsParams } from '../dtos';

/**
 * Servicio para obtener los análisis por dimensión de un docente evaluado
 * GET /evaluation-teacher/analytics/evaluations/{evaluationId}/evaluated/{userId}/dimensions
 */
export class GetTeacherDimensionsService {
  run(params: GetTeacherDimensionsParams, institutionId?: string) {
    const { evaluationId, userId, ...queryParams } = params;

    return axios
      .get(`${services.evaluationTeacher}/analytics/evaluations/${evaluationId}/evaluated/${userId}/dimensions`, {
        params: queryParams,
      })
      .then((response) => response.data as GetTeacherDimensionsResponse);
  }
}
