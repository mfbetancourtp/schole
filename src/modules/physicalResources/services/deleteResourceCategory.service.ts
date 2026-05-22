import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteResourceCategoryService {
  run(id: number) {
    return axios.delete(`${services.academic}/resource-categories/${id}`).then((response) => response.data);
  }
}
