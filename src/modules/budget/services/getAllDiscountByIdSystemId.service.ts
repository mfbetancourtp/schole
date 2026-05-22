import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAllDiscountByIdSystemIdService {
  run(systemId: number) {
    return axios.get(`${services.casurid}/admin-discounts-new?standardizedAccountingSystemId=${systemId}`).then((response) => response.data);
  }
}
