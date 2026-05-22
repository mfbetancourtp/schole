import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllOperationalSchemesService {
  async run(params: any) {
    return axios.get(`${services.structure}/operational-schemes`, { params }).then((response) => response.data);
  }
}
