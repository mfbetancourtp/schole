import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllRolesAdministrativeService {
  async run() {
    return axios.get<any[]>(`${services.users}/access/roles-type-administrative`).then((response) => response.data);
  }
}
