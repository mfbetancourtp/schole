import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTypeLmsInstitutionPlatformsService {
  async run() {
    return axios.get<any>(`${services.lms}/admin/type-lms-platforms`).then((response) => response.data);
  }
}
