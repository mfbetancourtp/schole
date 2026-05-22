import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteGraduateFileService {
  run(id: number) {
    return axios.delete(`${services.graduates}/files/${id}`).then((r) => r.data);
  }
}
