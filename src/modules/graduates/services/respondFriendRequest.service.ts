import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class RespondFriendRequestService {
  run(id: number, status: 'Aceptado' | 'Rechazado' | 'Bloqueado') {
    return axios.put(`${services.graduates}/friends/${id}`, { status }).then((r) => r.data);
  }
}
