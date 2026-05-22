import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetProductionTypesService {
  run(params?: any) {
    return axios.get(`${services.structure}/production-types`, { params }).then((response) => response.data);
  }
}
