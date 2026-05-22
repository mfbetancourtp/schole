import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcadPeriLevelAllCoursesService {
  run(academicPeriodGroupId: any) {
    return axios.get(`${services.classroom}/classroom-administration/academic-period/${academicPeriodGroupId}/all-courses`).then((response) => response.data);
  }
}
