import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteScheduleSettingsMilestoneService {
  run(id: number) {
    return axios.delete(`${services.structure}/schedule-settings-milestones/${id}`).then((response) => response.data);
  }
}
