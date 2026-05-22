import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetRelatedDataGroupsByAcademicPeriodCopyService {
  run(id: number) {
    return axios.get(`${services.reports}/filters/related-data-groups-by-academic-period-copy/${id}`).then((response) => response.data);
  }
}
