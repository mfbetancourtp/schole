import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetResourceInventoryService {
  run(params?: any) {
    return axios.get(`${services.academic}/resources`, { params }).then((response) => response.data);
  }
}
