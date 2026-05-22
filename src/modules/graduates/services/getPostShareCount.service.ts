import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { PostShareCountDto } from '../dtos/post.dto';

export class GetPostShareCountService {
  run(graduatePostId: number) {
    return axios
      .get<PostShareCountDto>(`${services.graduates}/post-shares/count`, {
        params: { graduatePostId },
      })
      .then((r) => r.data);
  }
}
