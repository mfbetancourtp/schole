import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetPostsParams, GetPostsResponseDto } from '../dtos/post.dto';

export class GetPostsService {
  run(params?: GetPostsParams) {
    return axios.get<GetPostsResponseDto>(`${services.graduates}/posts`, { params }).then((r) => r.data);
  }
}
