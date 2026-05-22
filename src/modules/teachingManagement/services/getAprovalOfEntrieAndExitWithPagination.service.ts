import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAprovalOfEntrieAndExitWithPaginationService {
  async run(params: any) {
    return axios.get(`${services.structure}/main-assistences`, { params }).then((response) => response.data);
  }
}
