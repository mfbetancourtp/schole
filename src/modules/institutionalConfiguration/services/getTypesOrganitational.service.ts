import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTypesOrganitationalService {
  run(params?: any) {
    return axios.get(`${services.structure}/organization-types`, { params }).then((response) => response.data);
  }
}
