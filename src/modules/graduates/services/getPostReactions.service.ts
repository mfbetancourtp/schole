import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetReactionsParams } from '../dtos/post.dto';

export class GetPostReactionsService {
  run(params?: GetReactionsParams) {
    return axios.get(`${services.graduates}/post-reactions`, { params }).then((r) => r.data);
  }
}
