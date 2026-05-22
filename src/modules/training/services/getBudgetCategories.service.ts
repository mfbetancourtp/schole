import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetBudgetCategoriesService {
  run() {
    return axios.get(`${services.budget}/admin/budget-categories`).then((response) => response.data);
  }
}
