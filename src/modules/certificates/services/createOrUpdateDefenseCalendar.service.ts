import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CreateOrUpdateDefenseCalendarBodyDto } from '../dtos/defenseCalendar.dto';

export class CreateOrUpdateDefenseCalendarService {
  async run(body: CreateOrUpdateDefenseCalendarBodyDto, params?: { institutionId?: number }) {
    return axios
      .post(`${services.structure}/admin/application-projects-calendar`, body, {
        params,
      })
      .then((response) => response.data);
  }
}
