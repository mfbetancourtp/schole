import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOrganizationalUnitsService {
  run() {
    return axios.get<any>(`${services.organizational}/admin/organizational-units`).then((response) => response.data);
  }
}
