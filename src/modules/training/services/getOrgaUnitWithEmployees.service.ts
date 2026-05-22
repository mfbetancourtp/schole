import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOrgaUnitWithEmployeesService {
  async run() {
    return axios.get<any>(`${services.organizational}/admin/organizational-units-with-employees`).then((response) => response.data);
  }
}
