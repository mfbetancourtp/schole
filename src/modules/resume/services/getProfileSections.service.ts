import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetProfileSectionsService {
  run(params?: any): Promise<any[]> {
    return axios
      .get<any[]>(`${services.structure}/profile-sections`, {
        params: {
          noPag: true,
          ...params,
        },
      })
      .then((response) => response.data);
  }
}
