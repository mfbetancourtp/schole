import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetBudgetCategoriesPaginationService {
  run() {
    return axios.get(`${services.budget}/admin/budget-categories-pagination`).then((response) => response.data);
  }
}
