import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class DownloadBookGradeService {
  async run(params: any): Promise<any> {
    return axios
      .get(`${services.reports}/report-store/download-report-cards-book-rating`, {
        params,
      })
      .then((response) => response.data);
  }
}
