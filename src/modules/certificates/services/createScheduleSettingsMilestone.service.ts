import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CreateScheduleSettingMilestoneDto } from '../dtos/scheduleConfig.dto';

export class CreateScheduleSettingsMilestoneService {
  run(data: CreateScheduleSettingMilestoneDto) {
    return axios.post(`${services.structure}/schedule-settings-milestones`, data).then((response) => response.data);
  }
}
