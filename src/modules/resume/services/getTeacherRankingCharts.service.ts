import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTeacherRankingChartsService {
  async run(params: any = {}) {
    return axios
      .get(`${services.structure}/teacher-ranking/charts`, {
        params,
      })
      .then((response) => response.data);
  }
}
