import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOrganizationsCampusesService {
  run(params?: any) {
    return axios
      .get<any>(`${services.structure}/campuses`, {
        params: { noPag: true, ...params },
      })
      .then((response) => response);
  }
}
