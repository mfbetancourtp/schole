import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetProgramTypesService {
  run(params: any) {
    return axios.get(`${services.structure}/program-types`, { params }).then((response) => response.data);
  }
}
