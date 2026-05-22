import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAllBankAccountService {
  run(systemId: number) {
    return axios.get(`${services.budget}/admin/bank-accounts?standardizedAccountingSystemId=${systemId}`).then((response) => response.data);
  }
}
