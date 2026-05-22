import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetResourceCategoriesService {
  run(params?: any) {
    return axios
      .get(`${services.academic}/resource-categories`, {
        params,
      })
      .then((response) => response.data);
  }
}
