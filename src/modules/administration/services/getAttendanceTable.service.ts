import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAttendaceTableService {
  run(params: any) {
    return axios.get(`${services.classroom}/classroom-administration/attendance-dashboard`, { params }).then((response) => response.data);
  }
}
