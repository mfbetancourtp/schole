import axios from '../utils/axios';
import { services } from '../constant/services';

export class GetTeachersForSelectService {
  async run(params: any) {
    return axios.get(`${services.users}/access/teachers-for-select`, { params }).then((response) => response.data);
  }
}
