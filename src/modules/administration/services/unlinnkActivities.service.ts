import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UnlinkActivitiesService {
  async run(activityId: number): Promise<void> {
    await axios.put(`${services.classroom}/classroom-assessment/activities/${activityId}`, {
      planningWeekId: null,
    });
  }
}
