import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ApplicationLogEntryDto } from '../dtos/adminApplications.dto';

export class GetScholarshipApplicationLogsService {
  run(id: number) {
    return axios.get<ApplicationLogEntryDto[]>(`${services.structure}/scholarship-applications/${id}/logs`).then((r) => r.data);
  }
}
