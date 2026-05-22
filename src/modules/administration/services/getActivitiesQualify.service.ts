import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { QualifyActivityDto } from '../dtos/qualifyActivity.dto';

export class GetActivitiesQualifyService {
  run(activityId: number) {
    return axios
      .get<QualifyActivityDto>(
        `${services.classroom}/classroom-assessment/activities-qualify/${activityId}`
      )
      .then((response) => response.data);
  }
}
