import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTravelExpensesInformationService {
  async run(courseId: number) {
    return axios.get<any>(`${services.classroom}/classroom-administration/travel-expenses-information?courseId=${courseId}`).then((response) => response.data);
  }
}
