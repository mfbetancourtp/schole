import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetRetiredStudentsWithPagination {
  async run(params: any) {
    return axios
      .get(`${services.dashboard}/retired-students`, {
        params,
      })
      .then((response) => response.data);
  }
}
