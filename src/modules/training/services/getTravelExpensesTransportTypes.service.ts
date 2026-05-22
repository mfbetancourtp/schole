import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTravelExpensesTransportTypesService {
  async run() {
    return axios.get<any>(`${services.classroom}/classroom-administration/travel-expenses-transport-types`).then((response) => response.data);
  }
}
