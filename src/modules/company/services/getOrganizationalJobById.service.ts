import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOrganizationalJobByIdService {
  run(id: any) {
    return axios.get<any>(`${services.organizational}/admin/organizational-jobs/${id}`).then((response) => response.data);
  }
}
