import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipApplicationsStatsItemDto } from '../dtos/adminApplications.dto';

export class GetScholarshipApplicationsStatsService {
  run() {
    return axios.get<ScholarshipApplicationsStatsItemDto[]>(`${services.structure}/scholarship-applications/stats`).then((r) => r.data);
  }
}
