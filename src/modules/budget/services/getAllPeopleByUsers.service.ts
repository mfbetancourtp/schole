import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllPeopleByUsersService {
  async run() {
    return axios.get<any[]>(`${services.users}/access/all-people-by-users`).then((response) => response.data);
  }
}
