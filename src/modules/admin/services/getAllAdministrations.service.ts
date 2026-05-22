import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllAdministrations {
  async run(params: any) {
    return axios
      .get(`${services.dashboard}/administrative`, {
        params,
      })
      .then((response) => response.data);
  }
}
