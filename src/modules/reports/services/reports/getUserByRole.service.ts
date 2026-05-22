import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetUserByRoleService {
  async run(roleId: any) {
    return axios.get<any>(`${services.users}/access/users-by-role/${roleId}`).then((response) => response.data);
  }
}
