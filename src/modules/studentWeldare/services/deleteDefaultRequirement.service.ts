import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteDefaultRequirementService {
  run(id: number) {
    return axios.delete(`${services.structure}/default-requirements/${id}`).then((r) => r.data);
  }
}
