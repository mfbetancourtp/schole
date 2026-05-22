import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetMatriculatesForObserverReport {
  run(params: any) {
    return axios
      .get(`${services.reports}/filters/matriculates-for-observer-report-store`, {
        params,
      })
      .then((response) => response.data);
  }
}
