import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTravelExpensesParamService {
  async run(travelExpenseId: number) {
    return axios.get<any>(`${services.classroom}/classroom-administration/travel-expenses-params?travelExpenseId=${travelExpenseId}`).then((response) => response.data);
  }
}
