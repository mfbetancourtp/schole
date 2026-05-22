import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { PostCategoryDto } from '../dtos/post.dto';

export class GetPostCategoriesService {
  run(params: { institutionId: number | null }) {
    return axios
      .get<PostCategoryDto[]>(`${services.graduates}/post-categories`, {
        params,
      })
      .then((r) => r.data);
  }
}
