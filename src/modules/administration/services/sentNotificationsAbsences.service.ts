import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class SentNotificationsAbsencesService {
  run(sessionId: number) {
    return axios.get(`${services.classroom}/classroom-implementation/sent-notifications-absences?sessionId=${sessionId}`).then((response) => response.data);
  }
}
