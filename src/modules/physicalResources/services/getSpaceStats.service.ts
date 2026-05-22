import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetSpaceStatsService {
  run() {
    return axios.get(`${services.academic}/spaces/stats`).then((response) => response.data);
  }
}
