import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetProgramsService {
  run(params?: any) {
    return axios.get(`${services.structure}/programs`, { params }).then((response) => response.data);
  }
}
