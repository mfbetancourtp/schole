import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PostSaveDefaultPlanningService {
  run(data: any) {
    return axios.post(`${services.classroom}/classroom-assessment/save-default-planning`, data).then((response) => response.data);
  }
}
