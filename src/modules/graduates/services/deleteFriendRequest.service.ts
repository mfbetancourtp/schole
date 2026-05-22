import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteFriendRequestService {
  run(id: number) {
    return axios.delete(`${services.graduates}/friends/${id}`).then((r) => r.data);
  }
}
