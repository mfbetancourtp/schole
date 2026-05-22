import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetTeacherSubjectsResponse, GetTeacherDetailParams } from '../dtos';

/**
 * Servicio para obtener el listado de asignaturas evaluadas de un docente
 * GET /evaluation-teacher/analytics/evaluations/{evaluationId}/evaluated/{userId}/subjects
 */
export class GetTeacherSubjectsService {
  run(params: GetTeacherDetailParams, institutionId?: string) {
    const { evaluationId, userId } = params;

    return axios.get(`${services.evaluationTeacher}/analytics/evaluations/${evaluationId}/evaluated/${userId}/subjects`, {}).then((response) => response.data as GetTeacherSubjectsResponse);
  }
}
