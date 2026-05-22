import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetStudentParticipationResponse } from '../dtos/applicationAssessments.dto';

/**
 * Servicio para obtener datos de participación estudiantil
 * GET /evaluation-teacher/evaluations/dashboard/student-participation
 
 */
export class GetStudentParticipationService {
  run(): Promise<GetStudentParticipationResponse> {
    return axios.get(`${services.evaluationTeacher}/evaluations/dashboard/student-participation`).then((response) => response.data);
  }
}
