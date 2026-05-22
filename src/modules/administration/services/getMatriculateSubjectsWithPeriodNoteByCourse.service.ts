import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMatriculateSubjectsWithPeriodNoteByCourseService {
  run(params: any = null) {
    return axios.get(`${services.academic}/academic-administration/matriculate-subjects-with-period-note-by-course`, { params }).then((response) => response.data);
  }
}
