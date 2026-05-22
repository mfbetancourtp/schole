import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCategoriesConfiguredByIndicatorService {
  run(courseId: any, learningOutcomeId: number) {
    return axios
      .get(`${services.classroom}/classroom-administration/courses/${courseId}/learningOutcomes/${learningOutcomeId}/learning-outcomes-activity-categories`)
      .then((response) => response.data);
  }
}
