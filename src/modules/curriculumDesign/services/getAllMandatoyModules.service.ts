import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllMandatoyModulesService {
  async run(params: any) {
    return axios.get(`${services.structure}/mandatoy-modules`, { params }).then((response) => response.data);
  }
}
