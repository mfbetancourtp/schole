import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { CourseDetailDto } from '../dtos/course.dto';

export class GetCourseByIdService {
  run(courseId: number) {
    return axios.get<CourseDetailDto>(`${services.classroom}/classroom-administration/courses/${courseId}`).then((response) => response.data);
  }
}
