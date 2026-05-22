import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ToggleReactionRequest } from '../dtos/post.dto';

export class TogglePostReactionService {
  run(body: ToggleReactionRequest) {
    return axios.post(`${services.graduates}/post-reactions`, body).then((r) => r.data);
  }
}
