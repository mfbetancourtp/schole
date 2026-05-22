import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteSkillService {
  run(id: number) {
    return axios.delete(`${services.graduates}/skills/${id}`).then((r) => r.data);
  }
}
