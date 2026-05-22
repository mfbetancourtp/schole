import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetFollowUpCoursesByAcademicPeriodIdService {
  async run(academicPeriodId: number) {
    return axios.get<any>(`${services.classroom}/classroom-administration/academic-period/${academicPeriodId}/follow-up-courses`).then((response) => response.data);
  }
}
