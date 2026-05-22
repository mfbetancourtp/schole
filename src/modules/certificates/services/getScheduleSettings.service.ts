import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScheduleSettingsPaginationDto } from '../dtos/scheduleConfig.dto';

interface IGetScheduleSettingsParams {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  order?: string;
  noPag?: string;
  id?: string | number;
}

export class GetScheduleSettingsService {
  run(params: IGetScheduleSettingsParams = {}) {
    return axios.get<ScheduleSettingsPaginationDto>(`${services.structure}/schedule-settings`, { params }).then((response) => response.data);
  }
}
