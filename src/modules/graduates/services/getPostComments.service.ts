import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetCommentsParams } from '../dtos/post.dto';

export class GetPostCommentsService {
  run(params?: GetCommentsParams) {
    return axios.get(`${services.graduates}/post-comments`, { params }).then((r) => r.data);
  }
}
