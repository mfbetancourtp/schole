import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteWorkExperienceService {
  run(id: number) {
    return axios.delete(`${services.graduates}/work-experiences/${id}`).then((r) => r.data);
  }
}
