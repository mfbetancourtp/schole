import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipSettingSummaryDto } from '../dtos/scholarshipConfig.dto';

export class GetScholarshipSettingsSummaryService {
  run() {
    return axios.get<ScholarshipSettingSummaryDto>(`${services.structure}/scholarship-settings/summary`).then((r) => r.data);
  }
}
