import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteApplicationProjectService {
  run(id: number) {
    return axios.delete(`${services.structure}/application-projects/${id}`).then((r) => r.data);
  }
}
