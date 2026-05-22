import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PostPersonalizedLearningOutcomesService {
  run(data: any) {
    return axios.post(`${services.classroom}/classroom-administration/learningOutcomes/personalize`, data).then((response) => response.data);
  }
}
