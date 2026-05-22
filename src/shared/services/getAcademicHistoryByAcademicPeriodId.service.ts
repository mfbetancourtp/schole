import axios from '../utils/axios';
import { services } from '../constant/services';

export class GetAcademicHistoryByAcademicPeriodIdService {
  run(studentId: any, params: any) {
    return axios
      .get(`${services.academic}/academic-administration/matriculate-data-profile/history/${studentId}`, {
        params,
      })
      .then((response) => response.data);
  }
}
