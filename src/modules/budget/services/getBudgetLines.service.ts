import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetBudgetLinesService {
  run() {
    return axios.get(`${services.budget}/admin/budget-lines`).then((response) => response.data);
  }
}
