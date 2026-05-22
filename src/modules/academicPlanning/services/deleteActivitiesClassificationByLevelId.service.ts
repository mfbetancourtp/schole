import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams {
  levelId: number;
  name: string;
  academicPeriodId: number;
}

export class DeleteActivitiesClassificationByLevelIdService {
  async run(params: IParams): Promise<void> {
    await axios.delete(`${services.classroom}/classroom-assessment/activity-categories-new`, {
      params,
    });
  }
}
