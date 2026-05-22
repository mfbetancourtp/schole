import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { DefenseCalendarStatsApi } from '../dtos/defenseCalendar.dto';

export class GetDefenseCalendarStatsService {
  async run(institutionId: number): Promise<DefenseCalendarStatsApi> {
    const response = await axios.get<any>(`${services.structure}/admin/application-projects-calendar/stats`, {
      params: { institutionId },
    });

    return (response.data?.data ?? response.data) as DefenseCalendarStatsApi;
  }
}
