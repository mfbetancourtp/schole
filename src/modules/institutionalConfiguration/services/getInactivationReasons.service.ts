import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetInactivationReasonsService {
  run(params?: any) {
    return axios.get(`${services.academic}/inactivation-reasons`, { params }).then((response) => response.data);
  }
}
