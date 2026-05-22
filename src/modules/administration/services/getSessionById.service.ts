import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { AttendanceFormDto } from '../dtos/attendance.dto';

export class GetSessionByIdService {
  run(sessionId: any) {
    return axios.get<AttendanceFormDto>(`${services.classroom}/classroom-implementation/sessions/${sessionId}`).then((response) => response.data);
  }
}
