import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetFeedParams, GetFeedResponseDto } from '../dtos/post.dto';

export class GetPostFeedService {
  run(params?: GetFeedParams) {
    return axios.get<GetFeedResponseDto>(`${services.graduates}/posts/feed`, { params }).then((r) => r.data);
  }
}
