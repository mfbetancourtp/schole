import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTopicsByCompetencyService {
  run(competencyId: any) {
    return axios.get(`${services.classroom}/classroom-administration/topics-by-competency/${competencyId}`).then((response) => response.data);
  }
}
