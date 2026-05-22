import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetSubjectCategoriesService {
  run(params?: any) {
    return axios.get<any>(`${services.structure}/subject-categories`, { params }).then((response) => response.data);
  }
}
