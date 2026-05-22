import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMyCoursesService {
  async run(academicPeriodId: number) {
    return axios.get<any>(`${services.classroom}/classroom-administration/academic-period/${academicPeriodId}/my-courses`).then((response) => response.data);
  }
}
