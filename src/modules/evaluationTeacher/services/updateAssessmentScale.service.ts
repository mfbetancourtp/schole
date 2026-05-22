import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { UpdateAssessmentScaleDto } from '../dtos/assessmentScale.dto';

export class UpdateAssessmentScaleService {
  run(id: number, payload: UpdateAssessmentScaleDto, institutionId?: string) {
    return axios
      .put(`${services.evaluationTeacher}/evaluation-scales/${id}`, payload, {
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
