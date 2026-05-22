import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetPublishMassiveReportStoreService {
  async run(params: any): Promise<any> {
    return axios
      .get(`${services.reports}/report-store/massivePublish`, {
        params,
      })
      .then((response) => response.data);
  }
}
