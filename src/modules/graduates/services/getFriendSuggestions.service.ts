import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetFriendSuggestionsService {
  run(params: { userId: number; institutionId: number }) {
    return axios.get(`${services.graduates}/friends/suggestions`, { params }).then((r) => r.data);
  }
}
