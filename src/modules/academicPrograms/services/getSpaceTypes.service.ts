import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetSpaceTypesService {
  run(params?: any) {
    return axios.get<any>(`${services.academic}/space-types`, { params }).then((response) => response.data);
  }
}
