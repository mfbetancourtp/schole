import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteApplicationCategoryService {
  run(id: number) {
    return axios.delete<any>(`${services.structure}/application-categories/${id}`).then((response) => response.data);
  }
}
