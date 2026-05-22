import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetTablesBudgetsService {
  async run() {
    return axios.get(`${services.budget}/admin/tables-budgets`).then((response) => response.data);
  }
}
