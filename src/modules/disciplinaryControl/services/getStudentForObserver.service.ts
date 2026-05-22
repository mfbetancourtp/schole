import axios from '../../../shared/utils/axios';

import { services } from '../../../shared/constant/services';

export class GetStudentForObserverService {
  run(userId: string) {
    return axios.get<any>(`${services.classroom}/disciplinary-control/student-for-observer/${userId}`).then((response) => response.data);
  }
}
