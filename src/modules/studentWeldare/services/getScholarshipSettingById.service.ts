import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipSettingDto } from '../dtos/scholarshipConfig.dto';

export class GetScholarshipSettingByIdService {
  run(id: number) {
    return axios.get<ScholarshipSettingDto>(`${services.structure}/scholarship-settings/${id}`).then((r) => r.data);
  }
}
