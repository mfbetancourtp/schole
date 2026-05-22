import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetDevelopmentMapRelatedDataService {
  run(params: any) {
    return axios
      .get<any>(`${services.organizational}/development-map-related-data`, {
        params,
      })
      .then((response) => response.data);
  }
}
