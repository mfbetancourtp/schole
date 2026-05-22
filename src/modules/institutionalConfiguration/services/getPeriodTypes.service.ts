import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPeriodTypesService {
  run(params?: any) {
    return axios.get(`${services.structure}/period-types`, { params }).then((response) => response.data);
  }
}
