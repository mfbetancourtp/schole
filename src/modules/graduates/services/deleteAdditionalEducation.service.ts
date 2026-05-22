import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAdditionalEducationService {
  run(id: number) {
    return axios.delete(`${services.graduates}/additional-educations/${id}`).then((r) => r.data);
  }
}
