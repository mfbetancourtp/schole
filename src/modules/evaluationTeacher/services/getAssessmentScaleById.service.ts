import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AssessmentScaleDto } from '../dtos/assessmentScale.dto';

export class GetAssessmentScaleByIdService {
  run(id: number, institutionId?: string) {
    return axios
      .get<{ statusCode: number; data: AssessmentScaleDto }>(`${services.evaluationTeacher}/evaluation-scales/${id}`, {
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
