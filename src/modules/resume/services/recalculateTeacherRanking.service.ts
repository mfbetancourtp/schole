import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface RecalculateTeacherRankingPayload {
  evaluationModelId: number | null;
}

export class RecalculateTeacherRankingService {
  async run(data: RecalculateTeacherRankingPayload) {
    return axios
      .post(`${services.structure}/teacher-ranking/recalculate`, {
        evaluationModelId: data.evaluationModelId,
      })
      .then((response) => response.data);
  }
}
