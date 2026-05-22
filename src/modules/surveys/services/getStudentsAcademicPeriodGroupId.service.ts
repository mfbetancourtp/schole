import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetStudentsAcademicPeriodGroupIdService {
  async run(academicPeriodGroupId: number) {
    return axios.get(`${services.academic}/academic-administration/students/academic-period-group/${academicPeriodGroupId}`).then((response) => response.data);
  }
}
