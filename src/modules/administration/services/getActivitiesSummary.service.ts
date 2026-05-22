import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { RelatedDataDto } from '../dtos/followUpToTopics.dto';

export class GetActivitiesSummaryService {
  run(courseId: number, params: any) {
    return axios.get(`${services.classroom}/classroom-assessment/courses/${courseId}/related-data-activities-summary`, { params }).then((response) => response.data);
  }
}
