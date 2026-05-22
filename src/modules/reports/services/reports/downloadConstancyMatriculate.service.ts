import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class DownloadConstancyMatriculateService {
  async run(params: any): Promise<any> {
    return axios
      .get(`${services.reports}/report-store/download-report-cards-certification-final`, {
        params,
      })
      .then((response) => response.data);
  }
}
