import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IGetNotificationsNotOpenService {
  userId: any;
  stateOpen: any;
}

export class GetNotificationsNotOpenMessagesService {
  async run(params?: IGetNotificationsNotOpenService) {
    return axios
      .get(`${services.communications}/notifications-not-open-pagination-messages`, { params })
      .then((response) => response.data);
  }
}
