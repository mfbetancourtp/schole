import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetConnectionsService {
  run(params: { userId: number; institutionId: number }) {
    return axios.get(`${services.graduates}/friends/connections`, { params }).then((r) => r.data);
  }
}
