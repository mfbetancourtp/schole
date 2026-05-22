import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEducationTypesService {
  run(params?: any) {
    return axios.get(`${services.structure}/education-types`, { params }).then((response) => response.data);
  }
}
