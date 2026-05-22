import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetLearningOutcomesByCompetencyService {
  run(competencyId: any) {
    return axios.get(`${services.classroom}/classroom-administration/learningOutcomes-by-competency/${competencyId}`).then((response) => response.data);
  }
}
