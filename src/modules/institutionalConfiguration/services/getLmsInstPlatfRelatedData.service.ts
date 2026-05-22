import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetLmsInstPlatfRelatedDataService {
  async run(params: any) {
    return axios.get<any>(`${services.lms}/admin/lms-institution-platforms-related-data`, { params }).then((response) => response.data);
  }
}

