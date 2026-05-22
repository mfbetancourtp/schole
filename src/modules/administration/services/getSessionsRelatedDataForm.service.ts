import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { AttendanceRelatedDataDto } from '../dtos/attendance.dto';

export class GetSessionsRelatedDataFormService {
  run(courseId: any) {
    return axios.get<AttendanceRelatedDataDto>(`${services.classroom}/classroom-implementation/courses/${courseId}/sessions-related-form-data`).then((response) => response.data);
  }
}
