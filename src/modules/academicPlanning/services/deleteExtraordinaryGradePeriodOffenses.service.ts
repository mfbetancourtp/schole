import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteExtraordinaryGradePeriodOffensesService {
  async run(id: any): Promise<void> {
    await axios.delete(`${services.academic}/academic-planning/extraordinary-grade-periods/${id}`);
  }
}
