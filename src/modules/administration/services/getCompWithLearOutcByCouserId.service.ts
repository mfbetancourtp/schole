import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCompWithLearOutcByCouserIdService {
  run(courseId: number) {
    return axios.get(`${services.classroom}/classroom-administration/course/${courseId}/competencies-with-learningOutcomes`).then((response) => response.data);
  }
}
