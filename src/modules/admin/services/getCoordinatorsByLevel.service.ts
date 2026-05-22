import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCoordinatorsByLevelWithPagination {
  async  run(params: any) {
    return axios
      .get(`${services.dashboard}/coordinators`, {
        params,
      })
      .then((response) => response.data);
  }
}
