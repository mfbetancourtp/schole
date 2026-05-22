import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetAllRolesWithProfileService {
  async run(params: any): Promise<any> {
    return axios
      .get(`${services.users}/access/roles`, {
        params,
      })
      .then((response) => response.data);
  }
}
