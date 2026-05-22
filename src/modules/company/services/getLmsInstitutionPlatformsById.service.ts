import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetLmsInstitutionPlatformsByIdService {
  async run(id: number) {
    return axios.get<any>(`${services.lms}/admin/lms-institution-platforms/${id}`).then((response) => response.data);
  }
}
