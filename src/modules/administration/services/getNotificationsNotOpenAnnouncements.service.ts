import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IGetNotificationsNotOpenService {
  userId: any;
  stateOpen: any;
}

export class GetNotificationsNotOpenAnnouncementsService {
  async run(params?: IGetNotificationsNotOpenService) {
    return axios
      .get(`${services.communications}/notifications-not-open-pagination-announcements`, { params })
      .then((response) => response.data);
  }
}
