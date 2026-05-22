import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetSubjectsByLevelWithPagination {
  async run(params: any) {
    return axios
      .get(`${services.dashboard}/subjects`, {
        params,
      })
      .then((response) => response.data);
  }
}
