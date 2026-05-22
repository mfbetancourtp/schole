import axios from '../../../shared/utils/axios';

import { services } from '../../../shared/constant/services';

export class GetStudentOffensesSummaryService {
  run(userId: string, params: any) {
    return axios.get<any>(`${services.classroom}/disciplinary-control/student-offenses-summary/${userId}`, { params }).then((response) => response.data);
  }
}
