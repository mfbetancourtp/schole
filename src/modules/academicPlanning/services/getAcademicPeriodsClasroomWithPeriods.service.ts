import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicPeriodsClasroomWithPeriodsService {
  async run(params: any) {
    return axios.get<any>(`${services.classroom}/classroom-implementation/time-tables-import-template`, { params }).then((response) => response.data);
  }
}
