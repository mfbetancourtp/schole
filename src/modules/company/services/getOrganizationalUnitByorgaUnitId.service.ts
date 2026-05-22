import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOrganizationalUnitByorgaUnitIdService {
  run(orgaUnitId: number) {
    return axios.get(`${services.organizational}/admin/organizational-units/${orgaUnitId}`).then((response) => response.data);
  }
}
