import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class UpdateReportStoreService {
  async run(reportStoreId: number, state: string): Promise<any> {
    return axios
      .post(`${services.reports}/report-store/${reportStoreId}`, { state })
      .then((response) => response.data);
  }
}
