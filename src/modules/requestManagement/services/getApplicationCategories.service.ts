import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetApplicationCategoriesService {
  run(params?: Record<string, any>) {
    return axios.get<any>(`${services.structure}/application-categories`, { params }).then((response) => response.data);
  }
}
