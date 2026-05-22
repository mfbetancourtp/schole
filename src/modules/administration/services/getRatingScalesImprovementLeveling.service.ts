import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { CourseDetailDto } from '../dtos/course.dto';

export class GetRatingScalesImprovementLevelingService {
  run(courseId: number) {
    return axios.get<CourseDetailDto>(`${services.academic}/academic-programs/rating-scales-improvement-leveling/${courseId}`).then((response) => response.data);
  }
}
