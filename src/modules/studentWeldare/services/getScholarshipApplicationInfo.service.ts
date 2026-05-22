import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipApplicationInfoResponseDto } from '../dtos/scholarshipApplication.dto';

export class GetScholarshipApplicationInfoService {
  run(id: number) {
    return axios.get<ScholarshipApplicationInfoResponseDto>(`${services.structure}/scholarship-catalog/${id}/application-info`).then((r) => r.data);
  }
}
