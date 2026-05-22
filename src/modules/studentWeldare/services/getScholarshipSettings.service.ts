import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipSettingPaginatedDto } from '../dtos/scholarshipConfig.dto';

export class GetScholarshipSettingsService {
  run(params?: any) {
    return axios.get<ScholarshipSettingPaginatedDto>(`${services.structure}/scholarship-settings`, { params }).then((r) => r.data);
  }
}
