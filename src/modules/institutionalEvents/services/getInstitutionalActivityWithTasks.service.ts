import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetInstitutionalActivityWithTasksService {
  run(id: number) {
    return axios.get(`${services.configurations}/institutional-activity-with-tasks/${id}`).then((response) => response.data);
  }
}
