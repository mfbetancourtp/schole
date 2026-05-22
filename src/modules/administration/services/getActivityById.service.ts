import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { ActivityDetailDto } from '../dtos/activity.dto';

export class GetActivityByIdService {
  run(activityId: any) {
    return axios.get<ActivityDetailDto>(`${services.classroom}/classroom-assessment/activities/${activityId}`).then((response) => response.data);
  }
}
