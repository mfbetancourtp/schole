import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllRolesAcademicService {
  async run() {
    return axios.get<any[]>(`${services.users}/access/roles-academics`).then((response) => response.data);
  }
}
