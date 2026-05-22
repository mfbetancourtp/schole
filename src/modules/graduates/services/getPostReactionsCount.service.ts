import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPostReactionsCountService {
  run(params: { graduatePostId: number }) {
    return axios.get(`${services.graduates}/post-reactions/count`, { params }).then((r) => r.data);
  }
}
