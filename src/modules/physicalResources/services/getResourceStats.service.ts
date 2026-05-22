import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetResourceStatsService {
  run() {
    return axios.get(`${services.academic}/resources/stats`).then((response) => response.data);
  }
}
