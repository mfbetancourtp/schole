import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTypesFinancingParentService {
  async run(typeFinancingParentId: number) {
    await axios.delete(`${services.budget}/admin/type-financing-sources/${typeFinancingParentId}`);
  }
}
