import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { RelatedDataDto } from '../dtos/followUpToTopics.dto';

export class GetExtraordinaryGradeperiodsService {
  run(courseId: number, params: any) {
    return axios.get(`${services.academic}/academic-planning/course/${courseId}/extraordinary-grade-periods`, { params }).then((response) => response.data);
  }
}
