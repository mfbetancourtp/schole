import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePlanningWeeksService {
  async run(planningWeekId: number): Promise<void> {
    await axios.delete(`${services.classroom}/classroom-assessment/planning-weeks/${planningWeekId}`);
  }
}
