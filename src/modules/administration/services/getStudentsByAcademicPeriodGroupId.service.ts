import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetStudentsByAcademicPeriodGroupIdService {
  run(academicPeriodGroupId: any, params: any = null) {
    return axios.get(`${services.academic}/academic-administration/students/academic-period-group/${academicPeriodGroupId}`, { params }).then((response) => response.data);
  }
}
