import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetListBudgetValidity {
  run() {
    return axios.get(`${services.budget}/admin/budget-validates`).then((response) => response.data);
  }
}
