import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteIndustryService {
  run(id: number) {
    return axios.delete(`${services.graduates}/industries/${id}`).then((r) => r.data);
  }
}
