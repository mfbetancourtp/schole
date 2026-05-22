import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GraduateUserProfileDto } from '../dtos/post.dto';

export class GetGraduateUserProfileService {
  run(params: { userId: number }) {
    return axios.get<GraduateUserProfileDto>(`${services.graduates}/dashboard/user-profile`, { params }).then((r) => r.data);
  }
}
