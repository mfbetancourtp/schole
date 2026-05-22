import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOrganizationTypesService {
  run(params?: any) {
    return axios.get(`${services.structure}/organization-types`, { params }).then((response) => response.data);
  }
}
