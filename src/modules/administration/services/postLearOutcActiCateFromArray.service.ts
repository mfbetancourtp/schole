import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PostLearOutcActiCateFromArrayService {
  run(data: any) {
    return axios.post(`${services.classroom}/classroom-administration/learning-outcomes-activity-categories-from-array`, data).then((response) => response.data);
  }
}
