import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetStudentsForObserverService {
  run(params: any) {
    return axios.get<any>(`${services.classroom}/disciplinary-control/students-for-observer`, { params }).then((response) => response.data);
  }
}
