import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetRenewedStudentsWithPagination {
  async run(params: any) {
    return axios
      .get(`${services.dashboard}/renewed-students`, {
        params,
      })
      .then((response) => response.data);
  }
}
