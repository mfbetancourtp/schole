import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScheduleSettingMilestoneDto } from '../dtos/scheduleConfig.dto';

interface IGetMilestonesParams {
  scheduleSettingsId?: number | string;
  noPag?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  order?: string;
}

export class GetScheduleSettingsMilestonesService {
  run(params: IGetMilestonesParams = {}) {
    return axios.get<ScheduleSettingMilestoneDto[]>(`${services.structure}/schedule-settings-milestones`, { params }).then((response) => response.data);
  }
}
