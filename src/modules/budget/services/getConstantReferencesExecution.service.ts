import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetConstantReferencesExecutionService {
  run() {
    return axios.get(`${services.budget}/admin/type-financing-sources-reference`).then((response) => response.data);
  }
}
