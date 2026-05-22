import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicEventsRolesService {
  run(params: any) {
    return axios.get(`${services.structure}/events-roles`, { params }).then((response) => response.data);
  }
}
