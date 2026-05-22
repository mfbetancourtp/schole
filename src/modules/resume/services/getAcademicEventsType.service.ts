import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicEventsTypeService {
  run(params: any) {
    return axios.get(`${services.structure}/events-types`, { params }).then((response) => response.data);
  }
}
