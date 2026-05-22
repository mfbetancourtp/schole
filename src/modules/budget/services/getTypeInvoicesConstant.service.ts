import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetTypeInvoicesConstantService {
  run() {
    return axios.get(`${services.budget}/admin/type-invoices-constant`).then((response) => response.data);
  }
}
