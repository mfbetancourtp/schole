import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAssessmentScaleService {
  run(id: number, institutionId?: string) {
    return axios
      .delete(`${services.evaluationTeacher}/evaluation-scales/${id}`, {
        headers: institutionId ? { institutionId } : undefined,
      })
      .then((response) => response.data);
  }
}
