import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMedicalRecordsWithPaginationService {
  async run(params: any) {
    return axios.get(`${services.users}/people/medical-records`, { params }).then((response) => response.data);
  }
}
