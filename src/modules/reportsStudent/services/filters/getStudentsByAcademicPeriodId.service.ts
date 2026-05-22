import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetStudentsByAcademicPeriodIdService {
  run(params: any) {
    return axios
      .get(`${services.reports}/filters/matriculates-for-report-store-final`, {
        params,
      })
      .then((response) => response.data);
  }
}
