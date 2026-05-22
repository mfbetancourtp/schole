import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetLanguagesService {
  run() {
    return axios.get(`${services.graduates}/languages`).then((r) => r.data);
  }
}
