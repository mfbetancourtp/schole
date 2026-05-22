import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetSentNotificationGeneralService {
  run(sessionId: number) {
    return axios.get(`${services.classroom}/classroom-implementation/sent-notifications-absences-general?sessionId=${sessionId}`).then((response) => response.data);
  }
}
