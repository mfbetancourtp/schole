import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetDataDetailedReportService {
  run(params: any) {
    return axios
      .get(`${services.organizational}/second-development-map-report`, {
        params,
      })
      .then((response) => response.data);
  }
}
