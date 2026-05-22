
import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';



export class GetRelatedDataScheduleParticipantsService {
  run(academicPeriodId: any) {
    return axios.get(`${services.reports}/filters/related-data-groups-by-academic-period-copy/${academicPeriodId}`).then((response) => response.data);
  }
}
