import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class ApproveOrDisapprovePlanningService {
  async run(id: any): Promise<void> {
    await axios.patch(`${services.classroom}/classroom-assessment/planning-week-is-approved/${id}`);
  }
}
