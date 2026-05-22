import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UpdateUserService {
  async run(UserId: number, active: number): Promise<any> {
    return axios
      .put(`${services.users}/access/users/${UserId}`, { active })
      .then((response) => response.data);
  }
}
