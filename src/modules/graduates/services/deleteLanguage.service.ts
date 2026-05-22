import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteLanguageService {
  run(id: number) {
    return axios.delete(`${services.graduates}/languages/${id}`).then((r) => r.data);
  }
}
