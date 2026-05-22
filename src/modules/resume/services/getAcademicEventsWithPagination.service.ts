import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicEventsWithPaginationService {
  run(params: any) {
    return axios.get(`${services.structure}/academicEvents`, { params }).then((response) => response.data);
  }
}
