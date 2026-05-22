import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCompetenciesWithLearningOutcomesService {
  run(courseId: number, params: any) {
    return axios.get(`${services.classroom}/classroom-administration/course/${courseId}/competencies-with-learningOutcomes`, { params }).then((response) => response.data);
  }
}
