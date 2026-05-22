import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class DownloadReportCardsFinalService {
  async run(params: any): Promise<any> {
    return axios
      .get(`${services.reports}/report-store/download-report-cards-final`, {
        params,
      })
      .then((response) => response.data);
  }
}
