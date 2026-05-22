import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteFinancingSystemsService {
  async run(systemId: number) {
    await axios.delete(`${services.budget}/admin/standardized-accounting-system/${systemId}`);
  }
}
