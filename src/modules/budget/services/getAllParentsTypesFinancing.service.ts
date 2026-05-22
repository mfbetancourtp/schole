import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAllParentsTypesFinancingService {
  async run(financingSystemId: number) {
    return axios.get(`${services.budget}/admin/type-financing-sources?standardizedAccountingSystemId=${financingSystemId}`).then((response) => response.data);
  }
}
