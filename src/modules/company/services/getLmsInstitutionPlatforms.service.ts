import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetLmsInstitutionPlatformsService {
  async run() {
    return axios.get<any>(`${services.lms}/admin/lms-institution-platforms`).then((response) => response.data);
  }
}
