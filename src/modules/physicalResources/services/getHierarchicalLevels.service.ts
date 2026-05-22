import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetHierarchicalLevelsService {
  run(params?: any) {
    return axios
      .get(`${services.academic}/hierarchical-levels`, {
        params,
      })
      .then((response) => response.data);
  }
}
