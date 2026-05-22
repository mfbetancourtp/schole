import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class createSendFriendRequestService {
  run(body: { userId: number; institutionId: number; friendId: number; message: string }) {
    return axios.post(`${services.graduates}/friends`, body).then((r) => r.data);
  }
}
