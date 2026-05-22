import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

interface IParams {
  executionExpense: boolean;
}
export class GetFinancingClassificationSystemService {
  run(params?: IParams) {
    return axios
      .get(`${services.budget}/admin/standardized-accounting-system`, {
        params,
      })
      .then((response) => response.data);
  }
}
