import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllStudentWithPagination {
  async  run(params: any) {
    return axios
      .get(`${services.dashboard}/Students`, {
        params,
      })
      .then((response) => response.data);
  }
}
