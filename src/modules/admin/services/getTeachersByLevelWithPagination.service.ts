import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTeachersByLevelWithPagination {
  async run(params: any) {
    return axios
      .get(`${services.dashboard}/teachers`, {
        params,
      })
      .then((response) => response.data);
  }
}
