import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllQrsService {
  async run(params: any = {}) {
    return axios
      .get(`${services.academic}/spaces`, {
        params: { ...params, perPage: 9999, page: 1 },
      })
      .then((response) => response.data);
  }
}
