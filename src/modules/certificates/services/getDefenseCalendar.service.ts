import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { DefenseCalendarItemApi } from '../dtos/defenseCalendar.dto';

export class GetDefenseCalendarService {
  async run(params: { institutionId: number; status?: string }): Promise<DefenseCalendarItemApi[]> {
    const response = await axios.get<any>(`${services.structure}/admin/application-projects-calendar`, {
      params,
    });

    const payload = response.data?.data ?? response.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.events)) {
      return payload.events;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.data?.events)) {
      return payload.data.events;
    }

    return [];
  }
}
