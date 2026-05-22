import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteScheduleSettingsService {
  run(id: number) {
    return axios.delete(`${services.structure}/schedule-settings/${id}`).then((response) => response.data);
  }
}
