import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { CourseScheduleDto } from '../dtos/courseSchedule.dto';

export class GetCoursesByAcadPeriIdService {
  async run(academicPeriodId: number) {
    return axios.get<CourseScheduleDto[]>(`${services.classroom}/classroom-administration/academic-period/${academicPeriodId}/courses`).then((response) => response.data);
  }
}
