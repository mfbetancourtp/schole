import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DuplicateScholarshipSettingService {
  run(id: number) {
    return axios.post(`${services.structure}/scholarship-settings/${id}/duplicate`).then((r) => r.data);
  }
}
