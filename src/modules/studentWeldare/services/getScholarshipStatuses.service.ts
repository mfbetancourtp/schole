import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipStatusPaginatedDto } from '../dtos/scholarshipStatus.dto';

export class GetScholarshipStatusesService {
  run(params?: any) {
    return axios.get<ScholarshipStatusPaginatedDto>(`${services.structure}/scholarship-statuses`, { params }).then((r) => r.data);
  }
}
