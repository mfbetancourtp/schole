import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePostCommentService {
  run(id: number) {
    return axios.delete(`${services.graduates}/post-comments/${id}`).then((r) => r.data);
  }
}
