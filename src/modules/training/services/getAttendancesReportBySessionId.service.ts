import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAttendancesReportBySessionIdService {
  async run(sessionId: number) {
    return axios.get<any>(`${services.classroom}/classroom-implementation/attendances-by-session?sessionId=${sessionId}`).then((response) => response.data);
  }
}
