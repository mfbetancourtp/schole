import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

// import { AttendanceFormDto } from '../dtos/attendance.dto';

export class GetSessionGeneralByIdService {
  run(sessionId: any) {
    return axios.get<any>(`${services.classroom}/classroom-implementation/session-general/${sessionId}`).then((response) => response.data);
  }
}
