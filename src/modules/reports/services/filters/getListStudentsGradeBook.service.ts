import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetListStudentsGradeBookService {
  run(params: any) {
    return axios
      .get(`${services.reports}/filters/matriculates-for-report-store-book-rating`, {
        params,
      })
      .then((response) => response.data);
  }
}
