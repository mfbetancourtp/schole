import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTypesFinancingChildService {
  async run(typeFinancingChildId: number) {
    await axios.delete(`${services.budget}/admin/financing-sources/${typeFinancingChildId}`);
  }
}
