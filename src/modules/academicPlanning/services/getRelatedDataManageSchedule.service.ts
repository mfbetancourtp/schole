import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { RelatedDataDto } from '../dtos/schedule.dto';

export class GetRelatedDataManageScheduleService {
  run(params: any) {
    return axios.get<RelatedDataDto>(`${services.classroom}/classroom-implementation/related-data-time-tables?academicperiodGroupId=${params.academicperiodGroupId}`).then((response) => response.data);
  }
}
