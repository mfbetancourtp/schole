import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetDataGeneralReportService {
  run(params: any) {
    return axios
      .get(`${services.organizational}/first-development-map-report`, {
        params,
      })
      .then((response) => response.data);
  }
}
