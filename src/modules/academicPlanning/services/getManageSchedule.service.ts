import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { ScheduleDto } from '../dtos/schedule.dto';

export class GetManageScheduleService {
  run(params: any) {
    return axios.get<any>(`${services.classroom}/classroom-implementation/time-tables-owner-user`, { params }).then((response) => response.data);
  }
}
