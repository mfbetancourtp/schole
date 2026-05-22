import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class SendNotificationOfficialService {
  async run(params: { convocationEnrolId: any; convocationStepId: any }) {
    return axios
      .get(`${services.academic}/academic-planning/notification-official`, {
        params,
      })
      .then((response) => response.data);
  }
}
