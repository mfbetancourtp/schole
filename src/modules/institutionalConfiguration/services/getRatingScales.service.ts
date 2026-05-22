import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetRatingScalesService {
  run(params?: any) {
    return axios.get(`${services.academic}/rating-scales`, { params }).then((response) => response.data);
  }
}
