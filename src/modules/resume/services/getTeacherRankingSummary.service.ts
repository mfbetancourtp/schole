import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTeacherRankingSummaryService {
  async run(params: any = {}) {
    return axios
      .get(`${services.structure}/teacher-ranking/summary`, {
        params,
      })
      .then((response) => response.data);
  }
}
