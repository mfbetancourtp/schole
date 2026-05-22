import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { CourseFormDto } from '../dtos/courseSchedule.dto';

export class GetCourseByIdService {
  async run(courseId: number) {
    return axios.get<CourseFormDto>(`${services.classroom}/classroom-administration/courses-edit?courseId=${courseId}`).then((response) => response.data);
  }
}
