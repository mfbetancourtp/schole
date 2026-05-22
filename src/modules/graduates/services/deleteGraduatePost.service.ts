import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteGraduatePostService {
  run(id: number) {
    return axios.delete(`${services.graduates}/posts/${id}`).then((r) => r.data);
  }
}
