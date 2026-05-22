import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IGetNotificationsNotOpenService {
  userId: number;
}

export class GetNotificationsNotOpenService {
  async run(params?: IGetNotificationsNotOpenService) {
    return axios.get(`${services.communications}/notifications-not-open`, { params }).then((response) => response.data);
  }
}
