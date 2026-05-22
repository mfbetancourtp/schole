import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetAssessmentScalesParams, GetAssessmentScalesResponseDto } from '../dtos/assessmentScale.dto';

export class GetEvaluationScalesService {
  run(params?: GetAssessmentScalesParams, institutionId?: string) {
    return axios
      .get<GetAssessmentScalesResponseDto>(`${services.evaluationTeacher}/evaluation-scales`, {
        params,
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
