import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CreateAssessmentScaleDto } from '../dtos/assessmentScale.dto';

export class CreateAssessmentScaleService {
  run(payload: CreateAssessmentScaleDto, institutionId?: string) {
    return axios
      .post(`${services.evaluationTeacher}/evaluation-scales`, payload, {
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
