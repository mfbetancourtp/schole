import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDataTemplateSubjectClasroomForImportService {
  run(params: any) {
    return axios.get(`${services.classroom}/classroom-implementation/time-tables-for-copy`, { params }).then((response) => response.data);
  }
}
