import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteSpaceService {
  run(id: number) {
    return axios.delete(`${services.academic}/spaces/${id}`).then((r) => r.data);
  }
}
