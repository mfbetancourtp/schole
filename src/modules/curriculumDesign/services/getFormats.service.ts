import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetFormatsService {
  run(params: any) {
    return axios.get(`${services.structure}/annexes`, { params }).then((response) => response.data);
  }
}
