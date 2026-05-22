import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export class GetActivitiesSummaryNewTableWithPaginationService {
  run(params: ParamsPaginationDto) {
    return axios.get(`${services.classroom}/classroom-assessment/courses/activities-summary-new-table`, { params }).then((response) => response.data.activitiesSummary);
  }
}
