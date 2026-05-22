import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteLevelByFinancingSystemService {
  async run(levelId: number) {
    await axios.delete(`${services.budget}/admin/levels-standardized-accounting-system/${levelId}`);
  }
}
