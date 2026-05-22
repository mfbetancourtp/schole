import axios from '../utils/axios';
import { services } from '../constant/services';

export class GetUsersForSelectService {
  async run(params: any) {
    return axios.get(`${services.users}/access/users-for-select`, { params }).then((response) => response.data);
  }
}
