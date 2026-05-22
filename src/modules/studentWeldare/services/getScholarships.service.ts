import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetScholarshipsService {
  run(params?: any) {
    return axios.get(`${services.studentWeldare}/scholarships`, { params }).then((response) => response.data);
  }
}
