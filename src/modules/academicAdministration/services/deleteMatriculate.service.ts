import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteMatriculateService {
  async run(id: number) {
    return axios.delete(`${services.academicAdministration}/matriculates/${id}`).then((response) => response.data);
  }
}
