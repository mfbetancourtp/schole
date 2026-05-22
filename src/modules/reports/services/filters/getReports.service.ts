import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetReportsService {
  async run(params: any): Promise<any> {
    return axios
      .get(`${services.reports}/report-store/report-store-by-matriculate-id`, {
        params,
      })
      .then((response) => response.data);
  }
}
