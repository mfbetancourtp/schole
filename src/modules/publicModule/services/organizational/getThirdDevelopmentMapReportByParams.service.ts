import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetThirdDevelopmentMapReportByParamsService {
  run(params: any) {
    return axios
      .get<any>(`${services.organizational}/third-development-map-report`, {
        params,
      })
      .then((response) => response.data);
  }
}
