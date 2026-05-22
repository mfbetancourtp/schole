import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetContractTypeRulesService {
  run(params?: any) {
    return axios.get<any>(`${services.graduates}/contract-types`, { params }).then((response) => response.data);
  }
}
