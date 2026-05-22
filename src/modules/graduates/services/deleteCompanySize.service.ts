import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteCompanySizeService {
  run(id: number) {
    return axios.delete(`${services.graduates}/company-sizes/${id}`).then((r) => r.data);
  }
}
