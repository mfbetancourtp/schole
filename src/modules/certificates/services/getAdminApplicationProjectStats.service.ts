import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AdminApplicationProjectStatsDto } from '../dtos/applicationProject.dto';

export class GetAdminApplicationProjectStatsService {
  run() {
    return axios.get<AdminApplicationProjectStatsDto>(`${services.structure}/admin/application-projects/stats`).then((r) => r.data);
  }
}
