import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetConfigurationTaskEventService {
  run(institutionalTaskId: any) {
    return axios.get(`${services.configurations}/institutional-task/${institutionalTaskId}`).then((response) => response.data);
  }
}
