import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface GetTeacherRankingParams {
  order?: string;
  page?: number;
  perPage?: number;
  search?: string;
  evaluationModelId?: number | string | null;
}

export class GetTeacherRankingService {
  run(params?: GetTeacherRankingParams) {
    return axios.get(`${services.structure}/teacher-ranking`, { params }).then((response) => response.data);
  }
}
