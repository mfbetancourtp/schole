import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteScholarshipSettingService {
  run(id: number) {
    return axios.delete(`${services.structure}/scholarship-settings/${id}`).then((r) => r.data);
  }
}
