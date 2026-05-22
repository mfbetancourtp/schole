import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOffenseTemplatesWithPaginationService {
  run(params: any) {
    return axios.get(`${services.classroom}/disciplinary-control/offense-templates-with-pagination`, { params }).then((response) => response.data);
  }
}
