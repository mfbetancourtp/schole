import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetGraduateFilesService {
  run(params: { peopleId: number }) {
    return axios.get(`${services.graduates}/files`, { params }).then((r) => r.data);
  }
}
