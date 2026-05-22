import axios from '../utils/axios';
import { services } from '../constant/services';

export class GetMonitoringStatusesService {
  run() {
    return axios.get(`${services.classroom}/disciplinary-control/monitoring-statuses`).then((response) => response.data);
  }
}
