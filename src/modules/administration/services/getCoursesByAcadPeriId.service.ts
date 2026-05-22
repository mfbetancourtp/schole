import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCoursesByAcadPeriIdService {
  async run(academicPeriodId: number, params: any) {
    return axios.get<any[]>(`${services.classroom}/classroom-administration/academic-period/${academicPeriodId}/courses`, { params }).then((response) => response.data);
  }
}
