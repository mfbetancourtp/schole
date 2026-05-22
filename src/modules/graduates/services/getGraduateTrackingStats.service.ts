import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GraduateTrackingStatsDto } from '../dtos/graduateTrackingStats.dto';

export class GetGraduateTrackingStatsService {
  run() {
    return axios.get<GraduateTrackingStatsDto>(`${services.graduates}/dashboard/stats`).then((r) => r.data);
  }
}
