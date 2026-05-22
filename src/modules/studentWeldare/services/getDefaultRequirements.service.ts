import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDefaultRequirementsService {
  run(params?: any) {
    return axios.get(`${services.structure}/default-requirements`, { params }).then((r) => r.data);
  }
}
