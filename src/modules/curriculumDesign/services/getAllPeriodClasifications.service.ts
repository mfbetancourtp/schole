import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllPeriodClasificationsService {
  run(params?: any) {
    return axios.get(`${services.structure}/period-clasifications`, { params }).then((response) => response.data);
  }
}
