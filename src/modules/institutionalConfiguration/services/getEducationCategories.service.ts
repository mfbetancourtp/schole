import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEducationCategoriesService {
  run(params?: any) {
    return axios.get(`${services.structure}/education-categories`, { params }).then((response) => response.data);
  }
}
