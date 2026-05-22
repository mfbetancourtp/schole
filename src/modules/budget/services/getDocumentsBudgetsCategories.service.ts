import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetDocumentsBudgetsCategoriesService {
  run() {
    return axios.get(`${services.budget}/admin/documents-budgets-categories`).then((response) => response.data);
  }
}
