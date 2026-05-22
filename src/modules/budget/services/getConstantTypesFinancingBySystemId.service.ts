import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetConstantTypesFinancingBySystemIdService {
  async run(systemId: number) {
    return axios.get(`${services.budget}/admin/standardized-accounting-system?standardizedAccountingSystemId=${systemId}`).then((response) => response.data);
  }
}
