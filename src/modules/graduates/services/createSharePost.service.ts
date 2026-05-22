import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class createSharePostService {
  run(body: { userId: number; graduatePostId: number; comment: string }) {
    return axios.post(`${services.graduates}/post-shares`, body).then((r) => r.data);
  }
}
