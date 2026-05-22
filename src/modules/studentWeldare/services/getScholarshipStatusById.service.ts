import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipStatusDto } from '../dtos/scholarshipStatus.dto';

export class GetScholarshipStatusByIdService {
  run(id: number) {
    return axios.get<ScholarshipStatusDto>(`${services.structure}/scholarship-statuses/${id}`).then((r) => r.data);
  }
}
