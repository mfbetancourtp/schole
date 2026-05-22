import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteProfessionalAreaService {
  run(id: number) {
    return axios.delete(`${services.graduates}/professional-areas/${id}`).then((r) => r.data);
  }
}
